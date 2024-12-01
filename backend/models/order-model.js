import { pool } from '../db/pool.js';
import { loadSchema } from '../utils/schema-loader.js';

/**
 * SQL schema for the CustomerOrder table.
 * @type {string}
 */
const orderSchema = `
CREATE TABLE IF NOT EXISTS CustomerOrder (
    orderId INT AUTO_INCREMENT NOT NULL,
    customerId INT NOT NULL,
    paymentId INT NOT NULL,
    shippingAddress VARCHAR(255) NOT NULL,
    orderTotal NUMERIC(15,2) NOT NULL,
    orderStatus ENUM (
        'processing', 'out for delivery',
        'delivered', 'cancelled'
    ) DEFAULT 'processing' NOT NULL,
    estimatedDeliveryDate DATE NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,

    PRIMARY KEY(orderId),
    FOREIGN KEY(customerId) REFERENCES Customer(customerId) 
        ON DELETE CASCADE,
    FOREIGN KEY(paymentId) REFERENCES Payment(paymentId)
        ON DELETE RESTRICT
)
`;

/**
 * SQL schema for the OrderItem table.
 * @type {string}
 */
const orderItemSchema = `
CREATE TABLE IF NOT EXISTS OrderItem (
    orderId INT NOT NULL,
    productId INT NOT NULL,
    productQuantity INT NOT NULL,

    PRIMARY KEY(orderId, productId),
    FOREIGN KEY(orderId) REFERENCES CustomerOrder(orderId) 
        ON DELETE CASCADE,
    FOREIGN KEY(productId) REFERENCES Product(productId) 
        ON DELETE RESTRICT
)
`;

/**
 * Loads the schemas for CustomerOrder and OrderItem tables.
 * @async
 * @function
 */
await loadSchema(pool, orderSchema, 'CustomerOrder');
await loadSchema(pool, orderItemSchema, 'OrderItem');

/**
 * Class representing order-related database operations.
 * @class OrderModel
 */
class OrderModel {

    /**
     * Creates a new customer order and its associated items.
     * @async
     * @param {object} connection - The database connection object.
     * @param {number} customerId - The ID of the customer placing the order.
     * @param {number} paymentId - The ID of the payment associated with the order.
     * @param {string} shippingAddress - The shipping address for the order.
     * @param {number} orderTotal - The total cost of the order.
     * @param {Array} orderItems - The list of items to be included in the order.
     * @returns {Promise<void>} Resolves when the order and items are created.
     */
    static async createOrder(
        connection, customerId, paymentId, shippingAddress, orderTotal, orderItems
    ) {
        const orderQuery = 'INSERT INTO CustomerOrder (customerId, paymentId, shippingAddress, orderTotal) '
            + 'VALUES(?, ?, ?, ?)';
        const [{ insertId: orderId }] = await connection.query(orderQuery, [
            customerId, paymentId, shippingAddress, orderTotal
        ]);

        console.log(orderId);

        const flattenedOrderItems = [];
        const placeholderTuples = [];
        for (let orderItem of orderItems) {
            flattenedOrderItems.push(orderId);
            flattenedOrderItems.push(orderItem.productId);
            flattenedOrderItems.push(orderItem.productQuantity);

            placeholderTuples.push('(?, ?, ?)');
        }

        const orderItemsQuery = 'INSERT INTO OrderItem (orderId, productId, productQuantity) '
            + 'VALUES '
            + placeholderTuples.join(',');

        await connection.query(orderItemsQuery, flattenedOrderItems);
    }

    /**
     * Retrieves a customer order by its ID.
     * @async
     * @param {object} connection - The database connection object.
     * @param {number} orderId - The ID of the order to retrieve.
     * @returns {Promise<object|null>} Resolves to the order object, or null if not found.
     */
    static async getOrderById(connection, orderId) {
        const query = 'SELECT * FROM CustomerOrder WHERE orderId = ?';
        const [results] = await connection.query(query, [orderId]);

        return results[0] || null;
    }

    /**
     * Retrieves all orders placed by a specific customer.
     * @async
     * @param {object} connection - The database connection object.
     * @param {number} customerId - The ID of the customer.
     * @returns {Promise<Array>} Resolves to an array of orders.
     */
    static async getOrdersByCustomer(connection, customerId) {
        const query = 'SELECT * FROM CustomerOrder WHERE customerId = ?';
        const [orders] = await connection.query(query, [customerId]);

        return orders;
    }

    /**
     * Retrieves all items for a specific order.
     * @async
     * @param {object} connection - The database connection object.
     * @param {number} orderId - The ID of the order.
     * @returns {Promise<Array>} Resolves to an array of order items.
     */
    static async getOrderItemsById(connection, orderId) {
        const query = 'SELECT * FROM OrderItem WHERE orderId = ?';
        const [orderItems] = await connection.query(query, [orderId]);

        return orderItems;
    }

    /**
     * Updates the status of a specific order.
     * @async
     * @param {object} connection - The database connection object.
     * @param {number} orderId - The ID of the order to update.
     * @param {string} orderStatus - The new status to set for the order.
     * @returns {Promise<void>} Resolves when the order status is updated.
     */
    static async updateOrderStatus(connection, orderId, orderStatus) {
        const query = 'UPDATE CustomerOrder SET orderStatus = ? WHERE orderId = ?';
        await connection.query(query, [orderStatus, orderId]);
    }

    /**
     * Updates the estimated delivery date of a specific order.
     * @async
     * @param {object} connection - The database connection object.
     * @param {number} orderId - The ID of the order to update.
     * @param {string} estimatedDeliveryDate - The new estimated delivery date for the order.
     * @returns {Promise<void>} Resolves when the estimated delivery date is updated.
     */
    static async updateEstimatedDeliveryDate(connection, orderId, estimatedDeliveryDate) {
        const query = 'UPDATE CustomerOrder SET estimatedDeliveryDate = ? WHERE orderId = ?';
        await connection.query(query, [estimatedDeliveryDate, orderId]);
    }
}

export {
    OrderModel,
}
