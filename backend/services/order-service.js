/**
 * Service to handle order-related operations for customers, including order creation, updates, and payment processing.
 */
class OrderService {

    /**
     * Creates a new order for a customer, after completing the checkout process.
     * 
     * @param {number} customerId - The ID of the customer placing the order.
     * @returns {Promise<number>} A promise that resolves to the newly created order ID.
     * @throws {Error} Throws an error if the checkout is not completed.
     * 
     * @example
     * const orderId = await OrderService.createOrder(customerId);
     */
    static async createOrder(customerId) {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        const hasCompletedCheckout = await CheckoutService.isComplete(customerId);

        if (!hasCompletedCheckout) {
            throw new Error('Checkout must be completed before creating an order');
        }

        const checkout = await CheckoutModel.settleSession(connection, customerId);
        const orderId = await OrderModel.createOrder(
            connection, checkout.customerId, checkout.paymentId,
            checkout.shippingAddress, checkout.amount, checkout.items
        );

        await OrderSimulationModel.createOrderSimulation(connection, orderId);

        const paymentInfo = await PaymentModel.getPaymentInformation(connection, checkout.paymentId);
        if (paymentInfo.paymentMethod === 'digital') {
            await PaymentModel.makePayment(connection, checkout.paymentId);
        }

        await connection.commit();
        await connection.release();

        return orderId;
    }

    /**
     * Updates the status and estimated delivery date of a list of orders based on order simulation data.
     * 
     * @param {Array<Object>} orders - The list of orders to update.
     * @returns {Promise<Array<Object>>} A promise that resolves to the updated list of orders.
     * 
     * @example
     * const updatedOrders = await OrderService.updateOrders(orders);
     */
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
