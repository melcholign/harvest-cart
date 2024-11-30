import { pool } from '../db/pool.js';
import { loadSchema } from '../utils/schema-loader.js';

const paymentCardSchema = `
CREATE TABLE IF NOT EXISTS PaymentCard (
    cardId INT AUTO_INCREMENT NOT NULL,
    cardNumber INT NOT NULL,
    cardType ENUM('debit', 'credit') NOT NULL,
    cvv INT NOT NULL,
    expiryDate DATE NOT NULL,
    brand ENUM('visa', 'mastercard', 'american express') NOT NULL,
    balance NUMERIC(15, 2) NOT NULL CHECK(balance >= 0) DEFAULT 0,

    PRIMARY KEY(cardId),
    UNIQUE(cardNumber, cardType, brand)
)
`;
await loadSchema(pool, paymentCardSchema, 'Payment Card');

class PaymentCardModel {

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

    static async getCardById(connection, cardId) {
        const getQuery = 'SELECT * FROM PaymentCard WHERE cardId = ?';

        const [results] = await connection.query(getQuery, [cardId]);

        if (results.length === 0) {
            throw new Error('Card does not exist');
        }

        return results[0];
    }

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