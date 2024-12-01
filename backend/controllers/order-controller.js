import { pool } from '../db/pool.js';
import { OrderModel } from '../models/order-model.js';
import { OrderService } from '../services/order-service.js';

class OrderController {

    static async placeOrder(req, res) {
        const { customerId } = req.user;

        try {
            await OrderService.createOrder(customerId);
        } catch (err) {
            return res.status(400).json({
                error: {
                    message: err.message,
                }
            });
        }

        res.status(201).json({});
    }

    static async getOrdersList(req, res) {
        const { customerId } = req.user;

        const orders = await OrderModel.getOrdersByCustomer(pool, customerId);
        const updatedOrders = await OrderService.updateOrders(orders);

        return res.status(200).json({
            data: updatedOrders,
        });
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

        const updatedOrder = await OrderService.updateOrders([order]);

        return res.status(200).json({
            data: updatedOrder,
        });
    }
}