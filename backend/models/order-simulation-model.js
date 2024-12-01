import { pool } from '../db/pool.js';
import { loadSchema } from '../utils/schema-loader.js';

const orderSimulationSchema = `
CREATE TABLE IF NOT EXISTS OrderSimulation (
    orderId INT NOT NULL,
    outForDeliveryDate DATE NOT NULL,
    deliveryDate DATE NOT NULL,

    PRIMARY KEY(orderId),
    FOREIGN KEY(orderId) REFERENCES CustomerOrder(orderId)
)   
`
await loadSchema(pool, orderSimulationSchema, 'OrderSimulation');

class OrderSimulationModel {

    static async createOrderSimulation(connection, orderId) {
        const outForDeliveryDateIncrement = 1 + Math.floor(Math.random() * 5);
        const deliveryDateIncrement = 1 + outForDeliveryDateIncrement + Math.floor(Math.random() * 2);

        const currentDate = new Date(Date.now());
        
        const outForDeliveryDate = new Date(currentDate);
        outForDeliveryDate.setDate(currentDate.getDate() + outForDeliveryDateIncrement);

        const deliveryDate = new Date(currentDate);
        deliveryDate.setDate(
            currentDate.getDate() + outForDeliveryDateIncrement + deliveryDateIncrement
        );

        const query = 'INSERT INTO OrderSimulation(orderId, outForDeliveryDate, deliveryDate) '
        + 'VALUES(?, ?, ?)';
        await connection.query(query, [orderId, outForDeliveryDate, deliveryDate]);
    }

    static async getOrderSimulation(connection, orderId) {
        const query = 'SELECT * FROM OrderSimulation WHERE orderId = ?';
        const [results] = await connection.query(query, [orderId]);

        return results[0];
    }
}

export {
    OrderSimulationModel,
}