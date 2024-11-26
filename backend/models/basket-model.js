import { loadSchema } from '../utils/schema-loader.js';
import { pool } from '../db/pool.js';
import mysql from 'mysql2';

const schema =
    `
CREATE TABLE IF NOT EXISTS Basket (
    customerId INT NOT NULL,
    productId INT NOT NULL,
    productQuantity INT NOT NULL DEFAULT 1,

    PRIMARY KEY(customerId, productId),
    FOREIGN KEY(customerId) REFERENCES Customer(customerId),
    FOREIGN KEY(productId) REFERENCES Product(productId)
)
`

// await loadSchema(connection, schema, 'Basket');

/**
 * @classdesc Model representing a basket that a customer 
 * carries to temporarily hold the products 
 * that they want to order.
 */
class BasketModel {
    /**
     * @async
     * @method getBasket
     * @description retrieve a customer's basket of products 
     * that they intend to ord
     * 
     * @param {mysql.Connection} connection - database connection
     * @param {Number} customerId - identifies the customer 
     * @returns {Array.<Object>} - list of objects, 
     * each containing a product's id, name, category, 
     * quantity in basket, unit price, and aggregate price, 
     * that represents a customer's basket  
     */
    static async getBasket(connection, customerId) {
        const query =
            'SELECT '
            + 'Basket.productId AS id, '
            + 'Product.productName AS name, '
            + 'COALESCE(Product.category, \'miscellaneous\') AS category, '
            + 'Basket.productQuantity AS quantity, '
            + 'Product.price AS unitPrice '
            + 'FROM Basket JOIN Product ON Basket.productId = Product.productId '
            + 'WHERE Basket.customerId = ?';
        const [results] = await connection.query(query, [customerId]);

        return results;
    }

    /**
     * @async
     * @method addProduct
     * @description Adds the specified product (with quantity 1) to a customer's basket
     * 
     * @param {mysql.Connection} connection - database connection
     * @param {Number} customerId - identifies a customer's basket
     * @param {Number} productId - identifies a product
     * @throws will throw an error if the product is out of stock
     */
    static async addProduct(connection, customerId, productId) {
        const query = 'INSERT INTO Basket(customerId, productId) '
            + 'SELECT ?, ? FROM Product '
            + 'WHERE Product.productId = ? AND Product.stockQuantity != 0';

        try {
            const [result] = await connection.query(query, [customerId, productId, productId]);
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                throw new Error('product already added', { cause: 'duplicate' })
            }
        }

        if (result.affectedRows === 0) {
            throw new Error('unable to add product', { cause: 'out of stock' });
        }
    }

    /**
     * @async
     * @method removeProduct
     * @description removes a product from a customer's basket
     * 
     * @param {mysql.Connection} connection - database connection
     * @param {Number} customerId - identifies the customer
     * @param {Number} productId - identifies the product
     * 
     * @throws an error when there is no product to remove
     */
    static async removeProduct(connection, customerId, productId) {
        const query = 'DELETE FROM Basket WHERE customerId = ? AND productId = ?';
        const [result] = await connection.query(query, [customerId, productId]);

        if (result.affectedRows == 0) {
            throw new Error('No product to remove', { cause: 'nonexistent product' });
        }
    }

    /**
     * @async
     * @method getQuantity
     * @description gets the quantity of a product in 
     * a customer's basket
     * 
     * @param {mysql.Connection} connection - database connection
     * @param {Number} customerId
     * @param {Number} productId
     * @returns {Number} quantity - the quantity of the product in
     * the customer's basket. Returns 0, if there is no such product in it.  
     */
    static async getQuantity(connection, customerId, productId) {
        const query = 'SELECT productQuantity FROM Basket '
            + 'WHERE customerId = ? AND productId = ?';
        console.time('getQuantity');
        const [results] = await connection.query(query, [customerId, productId]);
        console.timeEnd('getQuantity');
        return results[0]?.productQuantity || 0;
    }

    /**
     * @async
     * @method setQuantity
     * @description sets the quantity of a product item that a customer has added their basket
     * 
     * @param {mysql.Connection} connection - database connection
     * @param {Number} customerId 
     * @param {Number} productId 
     * @param {Number} newQuantity 
     * 
     * @throws an error if newQuantity < 0, and newQuantity > stockQuantity
     */
    static async setQuantity(connection, customerId, productId, newQuantity) {
        console.log({ customerId, productId, newQuantity });
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
     * @async
     * @method getAggregatePrice
     * @description calculates the aggregate price derived from a product's unit
     *  price and its quantity in a customer's basket
     * 
     * @param {mysql.Connection} connection - database connection
     * @param {Number} customerId - identifies the customer's basket
     * @param {Number} productId - identifies the product in the basket
     * @returns {Number} - aggregate price = unit price * quantity
     */
    static async getAggregatePrice(connection, customerId, productId) {
        const query = 'SELECT Basket.productQuantity, Product.price FROM Basket '
            + 'JOIN Product ON Basket.productId = Product.productId '
            + 'WHERE customerId = ? AND Product.productId = ?';
        const [results] = await connection.query(query, [customerId, productId]);
        console.log(results);

        if (results.length === 0) {
            throw new Error(
                'Cannot calculate aggregate price',
                { cause: 'Product not added to basket' }
            );
        }

        const product = results[0];
        const aggregatePrice = product.productQuantity * product.price;

        return aggregatePrice;
    }

    /**
     * @method clearBasket
     * @description clears a customer's basket off of products
     * 
     * @param {mysql.Connection} connection - database connection
     * @param {Number} customerId - identifies the customer
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