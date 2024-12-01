import { pool } from '../db/pool.js';
import { OrderModel } from '../models/order-model.js';
import { CheckoutModel } from '../models/checkout-model.js';
import { OrderSimulationModel } from '../models/order-simulation-model.js';
import { CheckoutService } from './checkout-service.js';

class OrderService {

    static async createOrder(customerId) {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        const hasCompletedCheckout = await CheckoutService.isComplete(customerId);

        if(!hasCompletedCheckout)  {
            throw new Error('Checkout must be completed before creating an order');
        }

        const checkout = await CheckoutModel.settleSession(connection, customerId);
        const orderId = await OrderModel.createOrder(
            connection, checkout.customerId, checkout.paymentId,
            checkout.shippingAddress, checkout.amount, checkout.items
        );

        await OrderSimulationModel.createOrderSimulation(connection, orderId);

        await connection.commit();
        await connection.release();

        return orderId;
    }

    static async updateOrders(orders) {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        for (let order of orders) {
            const orderSimulation = await OrderSimulationModel.getOrderSimulation(
                connection, order.orderId
            );

            if (
                (order.orderStatus !== 'delivered')
                && orderSimulation.deliveryDate <= Date.now()
            ) {
                await OrderModel.updateOrderStatus(
                    connection, order.orderId, 'delivered',
                )

                order.orderStatus = 'delivered';

                if (order.estimatedDeliveryDate === null) {
                    await OrderModel.updateEstimatedDeliveryDate(
                        connection, order.orderId, orderSimulation.deliveryDate
                    );

                    order.estimatedDeliveryDate = orderSimulation.deliveryDate;
                }
            }

            if (
                order.orderStatus === 'processing'
                && orderSimulation.outForDeliveryDate <= Date.now()
            ) {
                await OrderModel.updateOrderStatus(
                    connection, order.orderId, 'out for delivery'
                );

                order.orderStatus = 'out for delivery';

                await OrderModel.updateEstimatedDeliveryDate(
                    connection, order.orderId, orderSimulation.deliveryDate
                );

                order.estimatedDeliveryDate = orderSimulation.deliveryDate;
            }
        }

        await connection.commit();
        await connection.release();

        return orders;
    }
}

export {
    OrderService,
}