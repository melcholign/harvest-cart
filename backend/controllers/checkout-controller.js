import { pool } from '../db/pool.js';
import { BasketModel } from '../models/basket-model.js';
import { CheckoutModel } from '../models/checkout-model.js';
import { ProductModel } from '../models/product-model.js';

/**
 * @classdesc Controller for managing the checkout process in the shopping system.
 */
class CheckoutController {

    /**
     * Initiates the checkout process for the customer, verifying the basket 
     * and performing necessary operations like creating a checkout session 
     * and updating product stock.
     * 
     * @param {Object} req - The HTTP request object.
     * @param {Object} res - The HTTP response object.
     */
    static async startCheckout(req, res) {
        const { customerId } = req.user;
        const connection = await pool.getConnection();

        const basket = await BasketModel.getBasket(connection, customerId);

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
                aggregatePrice: item.unitPrice * item.quantity,
            }
        });

        await connection.beginTransaction();

        try {
            await CheckoutModel.createSession(connection, customerId, basketItems);
        } catch (err) {
            connection.rollback();
            return res.status(400).json({
                error: err.message,
            });
        }

        try {
            for (let item of basketItems) {
                await ProductModel.decreaseStock(connection, item.productId, item.productQuantity);
            }
        } catch (err) {
            connection.rollback();
            return res.status(400).json({
                error: err.message,
            });
        }

        await BasketModel.clearBasket(connection, customerId);

        await connection.commit();
        await connection.release();

        return res.sendStatus(200);
    }

    /**
     * Aborts the checkout process and restores the items to the customer's basket,
     * while also increasing product stock that was previously deducted.
     * 
     * @param {Object} req - The HTTP request object.
     * @param {Object} res - The HTTP response object.
     */
    static async abortCheckout(req, res) {
        const { customerId, checkoutSession } = req.user;

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        const checkoutItems = await CheckoutModel.abortSession(connection, customerId);

        for (let item of checkoutItems) {
            await BasketModel.addProduct(connection, customerId, item.productId);
            await BasketModel.setQuantity(connection, customerId, item.productId, item.productQuantity);
            await ProductModel.increaseStock(connection, item.productId, item.productQuantity);
        }

        await connection.commit();
        await connection.release();

        res.sendStatus(200);
    }

    /**
     * Sets the shipping address for the checkout process.
     * 
     * @param {Object} req - The HTTP request object.
     * @param {Object} req.body - The request body containing the shipping address.
     * @param {Object} res - The HTTP response object.
     */
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
};
