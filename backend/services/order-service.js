import { pool } from '../db/pool.js';
import { OrderModel } from '../models/order-model.js';
import { CheckoutModel } from '../models/checkout-model.js';

class OrderService {

    static async createOrder(customerId) {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        const checkout = await CheckoutModel.settleSession(connection, customerId);
        const orderId = await OrderModel.createOrder(
            connection, checkout.customerId, checkout.paymentId,
            checkout.shippingAddress, checkout.amount, checkout.items
        );

        await connection.commit();
        await connection.release();

        return orderId;
    }
}

export {
    OrderService,
}