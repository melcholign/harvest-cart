import { pool } from '../db/pool.js';
import { loadSchema } from '../utils/schema-loader.js';

const paymentSchema = `
CREATE TABLE IF NOT EXISTS Payment (
    paymentId INT AUTO_INCREMENT NOT NULL,
    customerId INT NOT NULL,
    paymentMethod ENUM ('cod', 'digital') NOT NULL,
    paymentStatus ENUM ('pending', 'paid', 'refund') DEFAULT 'pending' NOT NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK(amount >= 0),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY(paymentId),
    FOREIGN KEY(customerId) REFERENCES Customer(customerId)
)
`;

await loadSchema(pool, paymentSchema, 'Payment');

const onlineTransactionSchema = `
CREATE TABLE IF NOT EXISTS OnlineTransaction (
    paymentId INT NOT NULL,
    transactionId VARCHAR(255) NOT NULL,

    PRIMARY KEY(paymentId, transactionId),
    FOREIGN KEY(paymentId) REFERENCES Payment(paymentId)
)
`;

class PaymentModel {

    static PAYMENT_METHODS = {
        CASH_ON_DELIVERY: 'cod',
        DIGITAL: 'digital',
    }

    static async getPaymentInformation(connection, paymentId) {
        const getQuery = 'SELECT customerId, paymentMethod, paymentStatus, amount '
            + 'FROM Payment WHERE paymentId = ?';
        const [results] = await connection.query(getQuery, [paymentId]);

        if (results.length === 0) {
            throw new Error('No such payment has been created.');
        }

        return results[0];
    }

    static async createPayment(connection, customerId, paymentMethod, amount) {
        const createQuery = 'INSERT INTO Payment(customerId, paymentMethod, amount) '
            + 'VALUES (?, ?, ?)';
        const [{ insertId }] = await connection.query(createQuery, [customerId, paymentMethod, amount]);

        return insertId;
    }

    static async makePayment(connection, paymentId) {
        const updateQuery = 'UPDATE Payment SET paymentStatus = \'paid\' '
            + 'WHERE paymentId = ? AND paymentStatus = \'pending\'';
        const [result] = await connection.query(updateQuery, [paymentId]);

        if (result.affectedRows === 0) {
            const payment = await PaymentModel.getPaymentInformation(connection, paymentId);
            console.log(payment);

            if (payment.paymentStatus === 'refund') {
                throw new Error('payment was refunded');
            }

            if (payment.paymentStatus === 'paid') {
                throw new Error('payment has already been made');
            }
        }
    }

    static async processDigitalPayment(connection, paymentId, card, paymentProcessor) {
        try {
            const transactionId = await paymentProcessor.process(card);
            await PaymentModel.#createOnlineTransaction(connection, paymentId, transactionId);
        } catch (err) {
            throw err;
        }

        await makePayment(connection, paymentId);
    }

    static async refund(connection, paymentId, paymentProcessor) {
        try {
            const transactionId = await PaymentModel.#getOnlineTransactionId(paymentId);
            await paymentProcessor.refund(transactionId);
        } catch (err) {
            throw err;
        }

        const refundQuery = 'UPDATE Payment SET paymentStatus = \'refund\' WHERE paymentId = ?';
        await connection.query(refundQuery, [paymentId]);
    }

    static async #getOnlineTransactionId(connection, paymentId) {
        const getQuery = 'SELECT transactionId FROM OnlineTransaction WHERE paymentId = ?';
        const [results] = connection.query(getQuery, [paymentId]);

        if (results.length === 0) {
            throw new Error('no online transaction has been made');
        }

        return results[0].transactionId;
    }

    static async #createOnlineTransaction(connection, paymentId, transactionId) {
        const createQuery = 'INSERT INTO OnlineTransaction(paymentId, transactionId) VALUES (?, ?)';
        await connection.query(createQuery, [paymentId, transactionId]);
    }
}

export {
    PaymentModel,
}