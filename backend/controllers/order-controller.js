import { pool } from '../db/pool.js';
import { OrderModel } from '../models/order-model.js';

class OrderController {

    static async placeOrder(req, res) {
        const { customerId } = req.user;
        //... logic from validating checkout and creating order
        res.status(201).json({});
    }

    static async getOrdersList(req, res) {
        const { customerId } = req.user;

        const orders = await OrderModel.getOrdersByCustomer(pool, customerId);

        return res.status(200).json(orders);
    }

    static async getOrder(req, res) {
        const { customerId } = req.user;
        const { orderId } = req.params;

        const order = await OrderModel.getOrderById(pool, orderId, customerId);

        if (!order) {
            return res.status(404).json({
                error: 'order does not exist',
            });
        }

        return res.status(200).json(order);
    }
}