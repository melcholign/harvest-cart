import { pool } from '../db/pool.js';
import { loadSchema } from '../utils/schema-loader.js';

const onlineTransactionSchema = `
CREATE TABLE IF NOT EXISTS OnlineTransaction (
    cardId INT NOT NULL,
    paymentId INT NOT NULL,
    isRefunded BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY(cardId, paymentId),
    FOREIGN KEY(paymentId) REFERENCES Payment(paymentId),
    FOREIGN KEY(cardId) REFERENCES PaymentCard(cardId)
)
`;
await loadSchema(pool, onlineTransactionSchema, 'Online Transaction');

class OnlineTransactionModel {

    static async record(connection, cardId, paymentId) {
        const recordQuery = 'INSERT INTO OnlineTransaction(cardId, paymentId) '
            + 'VALUES(?, ?)';

        try {
            await connection.query(recordQuery, [cardId, paymentId]);
        } catch (err) {
            throw new Error('online transaction has already been recorded');
        }
    }
}

export {
    OnlineTransactionModel
}