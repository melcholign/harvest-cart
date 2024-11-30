import { pool } from '../db/pool.js';
import { loadSchema } from '../utils/schema-loader.js';

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
`

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
`

await loadSchema(pool, orderSchema, 'CustomerOrder');
await loadSchema(pool, orderItemSchema, 'OrderItem');

class OrderModel {

    static async createOrder(
        connection, customerId, paymentId, shippingAddress, orderTotal, orderItems
    ) {
        const orderQuery = 'INSERT INTO CustomerOrder (customerId, paymentId, shippingAddress, orderTotal) '
            + 'VALUES(?, ?, ?, ?)';
        const [{ insertId: orderId }] = await connection.query(orderQuery, [
            customerId, paymentId, shippingAddress, orderTotal
        ]);

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

    static async getOrderById(connection, orderId) {
        const query = 'SELECT * FROM CustomerOrder WHERE orderId = ?';
        const [results] = await connection.query(query, [orderId]);

        return results[0];
    }

    static async getOrdersByCustomer(connection, customerId) {
        const query = 'SELECT * FROM CustomerOrder WHERE customerId = ?';
        const [orders] = await connection.query(query, [customerId]);

        return orders;
    }

    static async getOrderItemsById(connection, orderId) {
        const query = 'SELECT * FROM OrderItem WHERE orderId = ?';
        const [orderItems] = await connection.query(query, [orderId]);

        return orderItems;
    }

    static async updateOrderStatus(connection, orderId, orderStatus) {
        const query = 'UPDATE CustomerOrder SET orderStatus = ? WHERE orderId = ?';
        await connection.query(query, [orderStatus, orderId]);
    }

    static async updateEstimatedDeliveryDate(connection, orderId, estimatedDeliveryDate) {
        const query = 'UPDATE CustomerOrder SET estimatedDeliveryDate = ? WHERE orderId = ?';
        await connection.query(query, [estimatedDeliveryDate, orderId]);
    }
}

export {
    OrderModel,
}