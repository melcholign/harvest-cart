import { pool } from '../db/pool.js';
import { loadSchema } from '../utils/schema-loader.js';

/**
 * SQL schema for the PaymentCard table.
 * @type {string}
 */
const paymentCardSchema = `
CREATE TABLE IF NOT EXISTS PaymentCard (
    cardId INT AUTO_INCREMENT NOT NULL,
    cardNumber INT NOT NULL,
    cardType ENUM('debit', 'credit') NOT NULL,
    cvv INT NOT NULL,
    expiryDate DATE NOT NULL,
    brand ENUM('visa', 'mastercard', 'american express') NOT NULL,
    balance NUMERIC(15, 2) NOT NULL DEFAULT 0,

    PRIMARY KEY(cardId),
    UNIQUE(cardNumber, cardType, brand)
)
`;

/**
 * Loads the PaymentCard schema.
 * @async
 * @function
 */
await loadSchema(pool, paymentCardSchema, 'Payment Card');

/**
 * Class representing the operations related to payment cards.
 * @class PaymentCardModel
 */
class PaymentCardModel {

    /**
     * Creates a new payment card.
     * @async
     * @param {Object} connection - The database connection object.
     * @param {number} cardNumber - The card number.
     * @param {string} cardType - The card type (either 'debit' or 'credit').
     * @param {number} cvv - The CVV number.
     * @param {string} expiryDate - The expiry date of the card (in 'YYYY-MM-DD' format).
     * @param {string} brand - The card brand (either 'visa', 'mastercard', or 'american express').
     * @returns {Promise<number>} Resolves to the ID of the newly created card.
     * @throws {Error} If the card already exists.
     */
    static async createPaymentCard(connection, cardNumber, cardType, cvv, expiryDate, brand) {
        const createQuery = 'INSERT INTO PaymentCard(cardNumber, cardType, cvv, expiryDate, brand) '
            + 'VALUES (?, ?, ?, ?, ?)';

        try {
            const [{ insertId }] = await connection.query(createQuery, [
                cardNumber,
                cardType,
                cvv,
                expiryDate,
                brand
            ]);

            return insertId;
        } catch (err) {
            throw new Error('Card already exists');
        }
    }

    /**
     * Retrieves a payment card by its ID.
     * @async
     * @param {Object} connection - The database connection object.
     * @param {number} cardId - The ID of the card.
     * @returns {Promise<Object>} Resolves to the payment card record.
     * @throws {Error} If the card does not exist.
     */
    static async getCardById(connection, cardId) {
        const getQuery = 'SELECT * FROM PaymentCard WHERE cardId = ?';

        const [results] = await connection.query(getQuery, [cardId]);

        if (results.length === 0) {
            throw new Error('Card does not exist');
        }

        return results[0];
    }

    /**
     * Retrieves a payment card by its details.
     * @async
     * @param {Object} connection - The database connection object.
     * @param {number} cardNumber - The card number.
     * @param {string} cardType - The card type (either 'debit' or 'credit').
     * @param {number} cvv - The CVV number.
     * @param {string} expiryDate - The expiry date of the card (in 'YYYY-MM-DD' format).
     * @param {string} brand - The card brand (either 'visa', 'mastercard', or 'american express').
     * @returns {Promise<Object>} Resolves to the payment card record.
     * @throws {Error} If the card does not exist.
     */
    static async getCardByDetails(connection, cardNumber, cardType, cvv, expiryDate, brand) {
        const getQuery = 'SELECT * FROM PaymentCard WHERE '
            + 'cardNumber = ? AND cardType = ? AND cvv = ? AND expiryDate = ? AND brand = ?';

        const [results] = await connection.query(getQuery, [
            cardNumber, cardType, cvv, expiryDate, brand
        ]);

        if (results.length === 0) {
            throw new Error('Card does not exist');
        }

        return results[0];
    }

    /**
     * Transfers funds between the card's balance (either deposit or withdrawal).
     * @async
     * @param {Object} connection - The database connection object.
     * @param {number} cardId - The ID of the card.
     * @param {number} amount - The amount to deposit or withdraw.
     * @param {string} action - The action for the transfer ('deposit' or 'withdraw').
     * @throws {Error} If the action is invalid or the amount is negative.
     * @throws {Error} If the transfer violates balance constraints (e.g., insufficient funds).
     */
    static async transfer(connection, cardId, amount, action) {
        if (action !== 'withdraw' && action !== 'deposit') {
            throw new Error('Invalid fund transfer action.');
        }

        if (amount < 0) {
            throw new Error(action + ' amount cannot be negative');
        }

        const transferQuery = 'UPDATE PaymentCard SET balance = balance '
            + (action === 'deposit' ? '+ ? ' : '- ? ')
            + 'WHERE cardId = ?';

        try {
            const [result] = await connection.query(transferQuery, [amount, cardId]);

            if (result.affectedRows === 0) {
                throw new Error('Invalid card id');
            }
        } catch (err) {
            if (err.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
                throw new Error('Withdrawing the amount causes balance to be negative');
            }

            throw err;
        }
    }
}

const id = await PaymentCardModel.transfer(pool, 1, 100, 'deposit');

export {
    PaymentCardModel,
}
