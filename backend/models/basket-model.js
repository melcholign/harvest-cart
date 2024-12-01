/**
 * @module basket-model.js
 */

import { pool } from '../db/pool.js';
import mysql from 'mysql2';

/**
 * SQL schema for the Basket table.
 * @type {string}
 */
const schema = `
CREATE TABLE IF NOT EXISTS Basket (
    customerId INT NOT NULL,
    productId INT NOT NULL,
    productQuantity INT NOT NULL DEFAULT 1,

    PRIMARY KEY(customerId, productId),
    FOREIGN KEY(customerId) REFERENCES Customer(customerId),
    FOREIGN KEY(productId) REFERENCES Product(productId)
)
`;

/**
 * @classdesc Model representing a customer's basket, which holds products
 * that they intend to order.
 */
class BasketModel {
    /**
     * Retrieves a customer's basket with product details.
     * @async
     * @method getBasket
     * @param {mysql.Connection} connection - The database connection.
     * @param {Number} customerId - The customer's unique identifier.
     * @returns {Array.<Object>} - List of products in the basket, with details like name, category, quantity, unit price.
     */
    static async getBasket(connection, customerId) {
        const query = 'SELECT Basket.productId AS id, Product.productName AS name, '
            + 'COALESCE(Product.category, \'miscellaneous\') AS category, '
            + 'Basket.productQuantity AS quantity, Product.price AS unitPrice '
            + 'FROM Basket JOIN Product ON Basket.productId = Product.productId '
            + 'WHERE Basket.customerId = ?';
        const [results] = await connection.query(query, [customerId]);

        return results;
    }

    /**
     * Adds a product to the customer's basket if in stock.
     * @async
     * @method addProduct
     * @param {mysql.Connection} connection - The database connection.
     * @param {Number} customerId - The customer's unique identifier.
     * @param {Number} productId - The product's unique identifier.
     * @throws {Error} - Throws if product is out of stock or already in the basket.
     */
    static async addProduct(connection, customerId, productId) {
        const query = 'INSERT INTO Basket(customerId, productId) '
            + 'SELECT ?, ? FROM Product '
            + 'WHERE Product.productId = ? AND Product.stockQuantity != 0';

        try {
            const [result] = await connection.query(query, [customerId, productId, productId]);

            if (result.affectedRows === 0) {
                throw new Error('unable to add product', { cause: 'out of stock' });
            }
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                throw new Error('product already added', { cause: 'duplicate' });
            }

            throw err;
        }
    }

    /**
     * Removes a product from the customer's basket.
     * @async
     * @method removeProduct
     * @param {mysql.Connection} connection - The database connection.
     * @param {Number} customerId - The customer's unique identifier.
     * @param {Number} productId - The product's unique identifier.
     * @throws {Error} - Throws if the product is not in the basket.
     */
    static async removeProduct(connection, customerId, productId) {
        const query = 'DELETE FROM Basket WHERE customerId = ? AND productId = ?';
        const [result] = await connection.query(query, [customerId, productId]);

        if (result.affectedRows == 0) {
            throw new Error('No product to remove', { cause: 'nonexistent product' });
        }
    }

    /**
     * Retrieves the quantity of a product in the customer's basket.
     * @async
     * @method getQuantity
     * @param {mysql.Connection} connection - The database connection.
     * @param {Number} customerId - The customer's unique identifier.
     * @param {Number} productId - The product's unique identifier.
     * @returns {Number} - The quantity of the product in the basket.
     */
    static async getQuantity(connection, customerId, productId) {
        const query = 'SELECT productQuantity FROM Basket '
            + 'WHERE customerId = ? AND productId = ?';
        const [results] = await connection.query(query, [customerId, productId]);
        return results[0]?.productQuantity || 0;
    }

    /**
     * Updates the quantity of a product in the customer's basket.
     * @async
     * @method setQuantity
     * @param {mysql.Connection} connection - The database connection.
     * @param {Number} customerId - The customer's unique identifier.
     * @param {Number} productId - The product's unique identifier.
     * @param {Number} newQuantity - The new quantity for the product.
     * @throws {Error} - Throws if the quantity is invalid or exceeds stock.
     */
    static async setQuantity(connection, customerId, productId, newQuantity) {
        if (newQuantity < 0) {
            throw new Error('invalid quantity', { cause: 'negative value' });
        }

        if (newQuantity == 0) {
            const query = 'DELETE FROM Basket WHERE customerId = ? AND productId = ?';
            return await connection.query(query, [customerId, productId]);
        }

        const query = 'UPDATE Basket SET productQuantity = ? '
            + 'WHERE customerId = ? AND productId = ? AND ? <= ('
            + 'SELECT stockQuantity FROM Product WHERE productId = ? )';

        const [result] = await connection.query(query, [
            newQuantity, customerId, productId, newQuantity, productId,
        ]);

        if (result.affectedRows == 0) {
            throw new Error('Invalid quantity', { cause: 'Exceeds stock quantity' });
        }
    }

    /**
     * Calculates the aggregate price of a product in the basket.
     * @async
     * @method getAggregatePrice
     * @param {mysql.Connection} connection - The database connection.
     * @param {Number} customerId - The customer's unique identifier.
     * @param {Number} productId - The product's unique identifier.
     * @returns {Number} - The aggregate price (unit price * quantity).
     * @throws {Error} - Throws if the product is not in the basket.
     */
    static async getAggregatePrice(connection, customerId, productId) {
        const query = 'SELECT Basket.productQuantity, Product.price FROM Basket '
            + 'JOIN Product ON Basket.productId = Product.productId '
            + 'WHERE customerId = ? AND Product.productId = ?';
        const [results] = await connection.query(query, [customerId, productId]);

        if (results.length === 0) {
            throw new Error(
                'Cannot calculate aggregate price',
                { cause: 'Product not added to basket' }
            );
        }

        const product = results[0];
        return product.productQuantity * product.price;
    }

    /**
     * Clears a customer's basket.
     * @async
     * @method clearBasket
     * @param {mysql.Connection} connection - The database connection.
     * @param {Number} customerId - The customer's unique identifier.
     * @throws {Error} - Throws if the basket is already empty.
     */
    static async clearBasket(connection, customerId) {
        const query = 'DELETE FROM Basket WHERE customerId = ?';
        const [result] = await connection.query(query, [customerId]);

        if (result.affectedRows == 0) {
            throw new Error('Basket is already empty', { cause: 'No products in basket' });
        }
    }
}

export {
    BasketModel,
}
