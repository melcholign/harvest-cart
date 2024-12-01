import { pool } from '../db/pool.js';
import { loadSchema } from '../utils/schema-loader.js';

/**
 * SQL schema for the OnlineTransaction table.
 * @type {string}
 */
const onlineTransactionSchema = `
CREATE TABLE IF NOT EXISTS OnlineTransaction (
    cardId INT NOT NULL,
    paymentId INT NOT NULL,
    isRefunded BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY(cardId, paymentId),
    FOREIGN KEY(paymentId) REFERENCES Payment(paymentId) ON DELETE CASCADE,
    FOREIGN KEY(cardId) REFERENCES PaymentCard(cardId)
)
`;

/**
 * Loads the OnlineTransaction schema.
 * @async
 * @function
 */
await loadSchema(pool, onlineTransactionSchema, 'Online Transaction');

/**
 * Class representing the operations related to online transactions.
 * @class OnlineTransactionModel
 */
class OnlineTransactionModel {

    /**
     * Records an online transaction.
     * @async
     * @param {Object} connection - The database connection object.
     * @param {number} cardId - The ID of the payment card.
     * @param {number} paymentId - The ID of the payment.
     * @throws {Error} If the online transaction has already been recorded.
     */
    static async record(connection, cardId, paymentId) {
        const recordQuery = 'INSERT INTO OnlineTransaction(cardId, paymentId) '
            + 'VALUES(?, ?)';

        try {
            await connection.query(recordQuery, [cardId, paymentId]);
        } catch (err) {
            throw new Error('online transaction has already been recorded');
        }
    }

    /**
     * Deletes an online transaction.
     * @async
     * @param {Object} connection - The database connection object.
     * @param {number} paymentId - The ID of the payment to delete the transaction for.
     */
    static async deleteOnlineTransaction(connection, paymentId) {
        const deleteQuery = 'DELETE FROM OnlineTransaction WHERE paymentId = ?';

        await connection.query(deleteQuery, [paymentId]);
    }
}

export {
    OnlineTransactionModel
}
