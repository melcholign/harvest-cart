import { pool } from '../db/pool.js';
import { OrderModel } from '../models/order-model.js';
import { OrderService } from '../services/order-service.js';

/**
 * @classdesc Controller that handles order-related operations, 
 * including placing an order, retrieving orders, and updating orders.
 */
class OrderController {

    /**
     * Places a new order for the customer.
     * 
     * @param {Object} req - The HTTP request object.
     * @param {Object} res - The HTTP response object.
     */
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

    /**
     * Retrieves a list of orders for the customer.
     * 
     * @param {Object} req - The HTTP request object.
     * @param {Object} res - The HTTP response object.
     */
    static async getOrdersList(req, res) {
        const { customerId } = req.user;

        const orders = await OrderModel.getOrdersByCustomer(pool, customerId);
        const updatedOrders = await OrderService.updateOrders(orders);

        return res.status(200).json({
            data: updatedOrders,
        });
    }

    /**
     * Retrieves a specific order for the customer.
     * 
     * @param {Object} req - The HTTP request object.
     * @param {Object} res - The HTTP response object.
     * @param {Number} req.params.orderId - The ID of the order to retrieve.
     */
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

export { OrderController };
