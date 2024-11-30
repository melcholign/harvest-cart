/**
 * @module checkout-module.js
 */

import { pool } from '../db/pool.js';
import { loadSchema } from '../utils/schema-loader.js';
import { BasketModel } from './basket-model.js';
import mysql from 'mysql2';

const checkoutSchema = `
CREATE TABLE IF NOT EXISTS Checkout (
    customerId INT NOT NULL,
    paymentId INT NULL,
    shippingAddress VARCHAR(255) NULL,
    amount NUMERIC(15,2) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY(customerId),
    FOREIGN KEY(customerId) REFERENCES Customer(customerId)
    -- FOREIGN KEY(paymentId) REFERENCES Payment(paymentId)
)
`;

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
 * @hideconstructor
 * @classdesc Model representing the checkout process
 */
class CheckoutModel {
    /**
     * @typedef {Object} CheckoutItem
     * @property {Number} productId
     * @property {Number} productQuantity
     */

    /**
     * @typedef {Object} Checkout
     * @property {Number} customerId
     * @property {String} shippingAddress
     * @property {Number} paymentId
     * @property {CheckoutItem[]} items
     */


    /**
     * Creates a checkout session that indicates that the checkout process for
     * the given customer is underway.
     * 
     * @param {mysql.Connection} connection - Database connection.
     * @param {Number} customerId - Identifies the customer who is checking out.
     * @param {Object[]} basketItems - Array of basket items.
     * @param {Number} basketItems[].productId - Identifies the product 
     * of an item.
     * @param {Number} basketItems[].productQuantity - Specifies the quantity 
     * of the product.
     * @param {Number} basketItems[].aggregatePrice - used to calculate the amount for checkout
     * @throws {Error} - When the checkout process is already running for a
     * customer. 
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
     * Retrieves customer's checkout session information
     * 
     * @param {mysql.Connection} connection - Database connection. 
     * @param {Number} customerId - Identifies customer's checkout session. 
     * @returns {Object} - Contains customer's ID (session identifier), 
     * their shipping address, and the payment ID
     */
    static async getSession(connection, customerId) {
        const getQuery = 'SELECT * FROM Checkout WHERE customerId = ?';
        const [results] = await connection.query(getQuery, [customerId]);

        return results[0];
    }

    /**
     * Aborts the checkout session of a customer if an order is
     * not to be placed.
     * 
     * @param {mysql.Connection} connection - Database connection.
     * @param {Number} customerId - Identifies customer who is checking out.
     * @returns {CheckoutItem[]} - Array of items to checkout that consists of 
     * pairs of product id and the quantity of a product. These items are
     * expected to be used to restore the state of the basket that was checked
     * out, and the inventory whose products were reserved for checkout.
     * @throws {Error} - When a session does not exist for it to be aborted.
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
     * Signifies the completion of the checkout process.
     * 
     * @param {mysql.Connection} connection - Database connection.
     * @param {Number} customerId - Identifies customer who is checking out.
     * @throws {Error} - When a session does not exist for it to be settled.
     * @throws {Error} - When a shipping address has not been provided 
     * in checkout.
     * @throws {Error} - When the payment option has not been determined in
     * checkout.
     * @returns {Checkout} - Contains all information related to the checkout.
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
     * Sets the shipping address of a customer during the checkout process.
     * 
     * @param {mysql.Connection} connection - Database connection.
     * @param {Number} customerId - Identifies customer who is checking out.
     * @param {String} shippingAddress - the address where the order will be 
     * delivered once checkout is completed.
     * @throws {Error} - When the checkout process is not occurring for shipping
     * address to be accepted
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
     * Sets the payment ID corresponding to the choice of payment method the
     * customer makes during checkout
     * 
     * @param {mysql.Connection} connection - Database connection.
     * @param {Number} customerId - Identifies customer who is checking out.
     * @param {String} paymentId - The payment ID associated with the payment
     * information provided by the customer 
     * @throws {Error} - When the checkout process is not occurring for payment
     * ID to be accepted.
     */
    static async setPaymentId(connection, customerId, paymentId) {
        const updateQuery = 'UPDATE Checkout SET paymentId = ? '
            + 'WHERE customerId = ?'; // and paymentId is valid
        const [result] = await connection.query(updateQuery, [paymentId, customerId]);

        if (result.affectedRows == 0) {
            throw new Error('Could not set paymentId', { cause: 'Session does not exist' });
        }
    }
}

// const basket = await BasketModel.getBasket(pool, 1);
// const basketItems = basket.map(basketItem => ({
//     productId: basketItem.id,
//     productQuantity: basketItem.quantity,
// }));
// console.log(basketItems);
// console.log(await CheckoutModel.createSession(pool, 1, basketItems));
// console.log(await CheckoutModel.abortSession(pool, 1));
// await CheckoutModel.setPaymentId(pool, 1, 3);
// console.log(await CheckoutModel.settleSession(pool, 1));

export {
    CheckoutModel,
}