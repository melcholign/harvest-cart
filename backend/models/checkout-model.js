/**
 * @module checkout-module.js
 */

import { pool } from '../db/pool.js';
import { loadSchema } from '../utils/schema-loader.js';
import { BasketModel } from './basket-model.js';
import mysql from 'mysql2';

/**
 * SQL schema for the Checkout table.
 * @type {string}
 */
const checkoutSchema = `
CREATE TABLE IF NOT EXISTS Checkout (
    customerId INT NOT NULL,
    paymentId INT NULL,
    shippingAddress VARCHAR(255) NULL,
    amount NUMERIC(15,2) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(customerId),
    FOREIGN KEY(customerId) REFERENCES Customer(customerId)
)
`;

/**
 * SQL schema for the CheckoutItem table.
 * @type {string}
 */
const checkoutItemSchema = `
CREATE TABLE IF NOT EXISTS CheckoutItem (
    customerId INT NOT NULL,
    productId INT NOT NULL,
    productQuantity INT NOT NULL,
    PRIMARY KEY(customerId, productId),
    FOREIGN KEY(customerId) REFERENCES Checkout(customerId) 
        ON DELETE CASCADE,
    FOREIGN KEY(productId) REFERENCES Product(productId)
)
`;

loadSchema(pool, checkoutSchema, 'Checkout');
await loadSchema(pool, checkoutItemSchema, 'Checkout Item');

/**
 * Model representing the checkout process.
 * @class CheckoutModel
 */
class CheckoutModel {
    /**
     * @typedef {Object} CheckoutItem
     * @property {Number} productId - The product's unique identifier.
     * @property {Number} productQuantity - Quantity of the product.
     */

    /**
     * @typedef {Object} Checkout
     * @property {Number} customerId - Unique identifier for the customer.
     * @property {String} shippingAddress - Address for delivery.
     * @property {Number} paymentId - Unique payment identifier.
     * @property {CheckoutItem[]} items - List of items in the checkout session.
     */

    /**
     * Creates a new checkout session for a customer with the provided basket items.
     * @param {mysql.Connection} connection - The database connection.
     * @param {Number} customerId - Customer's unique identifier.
     * @param {Object[]} basketItems - The basket items to be checked out.
     * @param {Number} basketItems[].productId - The product identifier.
     * @param {Number} basketItems[].productQuantity - The quantity of the product.
     * @param {Number} basketItems[].aggregatePrice - The total price for the item.
     * @throws {Error} - Throws if no items are provided or if a session already exists.
     */
    static async createSession(connection, customerId, basketItems) {
        if (basketItems.length == 0) {
            throw new Error('Cannot create session', {
                cause: 'New sessions require items to checkout'
            });
        }

        const amount = basketItems.reduce((sum, item) => {
            return sum + item.aggregatePrice;
        }, 0)

        const createSessionQuery = 'INSERT INTO Checkout(customerId, amount) VALUES(?, ?)';

        try {
            await connection.query(createSessionQuery, [customerId, amount]);
        } catch (err) {
            throw new Error('Checkout session already exists', {
                cause: 'Duplicate customer ID',
            });
        }

        const flattenedBasketItems = [];
        const placeholderTuples = [];
        for (let basketItem of basketItems) {
            flattenedBasketItems.push(customerId);
            flattenedBasketItems.push(basketItem.productId);
            flattenedBasketItems.push(basketItem.productQuantity);

            placeholderTuples.push('(?, ?, ?)');
        }

        const insertItemsQuery = 'INSERT INTO CheckoutItem '
            + '(customerId, productId, productQuantity) VALUES '
            + placeholderTuples.join(',');

        await connection.query(insertItemsQuery, flattenedBasketItems);
    }

    /**
     * Retrieves a customer's checkout session.
     * @param {mysql.Connection} connection - The database connection.
     * @param {Number} customerId - Customer's unique identifier.
     * @returns {Object} - The customer's checkout session details.
     */
    static async getSession(connection, customerId) {
        const getQuery = 'SELECT * FROM Checkout WHERE customerId = ?';
        const [results] = await connection.query(getQuery, [customerId]);

        return results[0];
    }

    /**
     * Aborts the checkout session for a customer.
     * @param {mysql.Connection} connection - The database connection.
     * @param {Number} customerId - Customer's unique identifier.
     * @returns {CheckoutItem[]} - The items that were in the checkout session.
     * @throws {Error} - Throws if the session does not exist.
     */
    static async abortSession(connection, customerId) {
        const getCheckoutItemsQuery = 'SELECT productId, productQuantity '
            + 'FROM CheckoutItem WHERE customerId = ?';
        const [checkoutItems] = await connection.query(getCheckoutItemsQuery, [customerId]);

        if (checkoutItems.length == 0) {
            throw new Error('Cannot abort a non-existent session', {
                cause: 'Non-existent checkout items for customer',
            });
        }

        const deleteCheckoutQuery = 'DELETE FROM Checkout WHERE customerId = ?';
        await connection.query(deleteCheckoutQuery, [customerId]);

        return checkoutItems;
    }

    /**
     * Finalizes the checkout process for a customer.
     * @param {mysql.Connection} connection - The database connection.
     * @param {Number} customerId - Customer's unique identifier.
     * @throws {Error} - Throws if the session is incomplete or missing required fields.
     * @returns {Checkout} - The finalized checkout session details.
     */
    static async settleSession(connection, customerId) {
        const getCheckoutQuery = 'SELECT * FROM Checkout JOIN CheckoutItem '
            + 'USING(customerId) WHERE customerId = ?';
        const [checkoutItems] = await connection.query(getCheckoutQuery, [customerId]);

        if (checkoutItems.length == 0) {
            throw new Error('Cannot settle non-existent session');
        }

        if (!checkoutItems[0].shippingAddress) {
            throw new Error('Cannot settle session without shipping address');
        }

        if (!checkoutItems[0].paymentId) {
            throw new Error('Cannot settle session without paymentId');
        }

        const deleteCheckoutQuery = 'DELETE FROM Checkout WHERE customerId = ?';
        await connection.query(deleteCheckoutQuery, [customerId]);

        const checkout = checkoutItems.reduce((partialCheckout, item) => {
            return {
                customerId: item.customerId,
                shippingAddress: item.shippingAddress,
                paymentId: item.paymentId,
                amount: item.amount,
                items: [
                    ...partialCheckout.items,
                    {
                        productId: item.productId,
                        productQuantity: item.productQuantity,
                    },
                ],
            }
        }, { items: [] });

        return checkout;
    }

    /**
     * Sets the shipping address for a customer's checkout session.
     * @param {mysql.Connection} connection - The database connection.
     * @param {Number} customerId - Customer's unique identifier.
     * @param {String} shippingAddress - The shipping address for delivery.
     * @throws {Error} - Throws if the session does not exist.
     */
    static async setShippingAddress(connection, customerId, shippingAddress) {
        const updateQuery = 'UPDATE Checkout SET shippingAddress = ? '
            + 'WHERE customerId = ?';
        const [result] = await connection.query(updateQuery, [shippingAddress, customerId]);

        if (result.affectedRows == 0) {
            throw new Error('Could not set shipping address', { cause: 'Session does not exist' });
        }
    }

    /**
     * Sets the payment ID for a customer's checkout session.
     * @param {mysql.Connection} connection - The database connection.
     * @param {Number} customerId - Customer's unique identifier.
     * @param {Number} paymentId - The payment identifier.
     * @throws {Error} - Throws if the session does not exist.
     */
    static async setPaymentId(connection, customerId, paymentId) {
        const updateQuery = 'UPDATE Checkout SET paymentId = ? '
            + 'WHERE customerId = ?';
        const [result] = await connection.query(updateQuery, [paymentId, customerId]);

        if (result.affectedRows == 0) {
            throw new Error('Could not set paymentId', { cause: 'Session does not exist' });
        }
    }
}

export {
    CheckoutModel,
}
