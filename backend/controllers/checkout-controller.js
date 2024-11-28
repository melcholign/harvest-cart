import { pool } from '../db/pool.js';
import { BasketModel } from '../models/basket-model.js';
import { CheckoutModel } from '../models/checkout-model.js';

class CheckoutController {

    static async startCheckout(req, res) {
        const { customerId } = req.user;
        const connection = await pool.getConnection();

        const basket = await BasketModel.getBasket(connection, customerId);
        console.log(basket);

        if (basket.length == 0) {
            return res.status(400).json({
                error: new Error('Cannot start checkout', {
                    cause: 'No basket to checkout',
                }),
            });
        }

        const basketItems = basket.map((item) => {
            return {
                productId: item.id,
                productQuantity: item.quantity,
            }
        });

        await connection.beginTransaction();

        try {
            await CheckoutModel.createSession(connection, customerId, basketItems);
        } catch (err) {
            // do not wait until rollback completes to send error response
            connection.rollback();
            return res.status(400).json({
                error: err,
            });
        }

        // // since it is already checked that the basket exists for the customer in
        // // the previous statements, there is no need to handle the exception of
        // // non-existent basket that would otherwise get thrown by the method
        // // when an empty basket is not checked for.
        await BasketModel.clearBasket(connection, customerId);

        await connection.commit();
        await connection.release();

        return res.sendStatus(200);
    }

    static async setShippingAddress(req, res) {
        const { customerId } = req.user;
        const { shippingAddress } = req.body;

        if (!shippingAddress) {
            return res.status(400).json({
                error: 'Shipping address cannot be empty',
            });
        }

        await CheckoutModel.setShippingAddress(pool, customerId, shippingAddress);

        return res.status(200);
    }
}

export {
    CheckoutController,
}