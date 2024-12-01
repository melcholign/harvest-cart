import { pool } from '../db/pool.js';
import { loadSchema } from '../utils/schema-loader.js';

/**
 * SQL schema for the Payment table.
 * @type {string}
 */
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

/**
 * Loads the Payment schema.
 * @async
 * @function
 */
await loadSchema(pool, paymentSchema, 'Payment');

/**
 * Class representing payment-related database operations.
 * @class PaymentModel
 */
class PaymentModel {

    /**
     * Enum for available payment methods.
     * @static
     * @readonly
     * @enum {string}
     */
    static PAYMENT_METHODS = {
        CASH_ON_DELIVERY: 'cod',
        DIGITAL: 'digital',
    }

    /**
     * Retrieves payment information by payment ID.
     * @async
     * @param {object} connection - The database connection object.
     * @param {number} paymentId - The ID of the payment to retrieve.
     * @returns {Promise<object>} Resolves to the payment information.
     * @throws {Error} If no payment with the given ID is found.
     */
    static async getPaymentInformation(connection, paymentId) {
        const getQuery = 'SELECT customerId, paymentMethod, paymentStatus, amount '
            + 'FROM Payment WHERE paymentId = ?';
        const [results] = await connection.query(getQuery, [paymentId]);

        if (results.length === 0) {
            throw new Error('No such payment has been created.');
        }

        return results[0];
    }

    /**
     * Creates a new payment.
     * @async
     * @param {object} connection - The database connection object.
     * @param {number} customerId - The ID of the customer making the payment.
     * @param {string} paymentMethod - The payment method to use ('cod' or 'digital').
     * @param {number} amount - The amount to be paid.
     * @returns {Promise<number>} Resolves to the ID of the newly created payment.
     */
    static async createPayment(connection, customerId, paymentMethod, amount) {
        const createQuery = 'INSERT INTO Payment(customerId, paymentMethod, amount) '
            + 'VALUES (?, ?, ?)';
        const [{ insertId }] = await connection.query(createQuery, [customerId, paymentMethod, amount]);

        return insertId;
    }

    /**
     * Marks a payment as completed (paid).
     * @async
     * @param {object} connection - The database connection object.
     * @param {number} paymentId - The ID of the payment to mark as paid.
     * @throws {Error} If the payment has already been paid or refunded.
     */
    static async makePayment(connection, paymentId) {
        const updateQuery = 'UPDATE Payment SET paymentStatus = \'paid\' '
            + 'WHERE paymentId = ? AND paymentStatus = \'pending\'';
        const [result] = await connection.query(updateQuery, [paymentId]);

        if (result.affectedRows === 0) {
            const payment = await PaymentModel.getPaymentInformation(connection, paymentId);

            if (payment.paymentStatus === 'refund') {
                throw new Error('payment was refunded');
            }

            if (payment.paymentStatus === 'paid') {
                throw new Error('payment has already been made');
            }
        }
    }

    /**
     * Changes the payment method of a pending payment.
     * @async
     * @param {object} connection - The database connection object.
     * @param {number} paymentId - The ID of the payment to update.
     * @param {string} paymentMethod - The new payment method.
     * @throws {Error} If the payment status is not pending.
     */
    static async changePaymentMethod(connection, paymentId, paymentMethod) {
        try {
            const paymentInfo = await PaymentModel.getPaymentInformation(connection, paymentId);
            if (paymentInfo.paymentStatus !== 'pending') {
                throw new Error('Cannot change method of non-pending payments');
            }
        } catch (err) {
            throw err;
        }

        const changeQuery = 'UPDATE Payment SET paymentMethod = ? '
            + 'WHERE paymentId = ? AND paymentStatus = ?';
        await connection.query(changeQuery, [paymentMethod, paymentId, 'pending']);
    }

    /**
     * Refunds a digital payment.
     * @async
     * @param {object} connection - The database connection object.
     * @param {number} paymentId - The ID of the payment to refund.
     */
    static async refund(connection, paymentId) {
        const refundQuery = 'UPDATE Payment SET paymentStatus = ? WHERE paymentId = ? AND paymentMethod = ?';
        await connection.query(refundQuery, ['refund', paymentId, 'digital']);
    }

    /**
     * Deletes a payment by its ID.
     * @async
     * @param {object} connection - The database connection object.
     * @param {number} paymentId - The ID of the payment to delete.
     * @throws {Error} If no payment with the given ID exists.
     */
    static async deletePayment(connection, paymentId) {
        const deleteQuery = 'DELETE FROM Payment WHERE paymentId = ?';

        const [result] = connection.query(deleteQuery, [paymentId]);

        if (result.affectedRows === 0) {
            throw new Error('No such payment exists.');
        }
    }
}

export {
    PaymentModel,
}
