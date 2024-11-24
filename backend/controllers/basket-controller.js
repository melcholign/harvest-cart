import { BasketModel } from '../models/basket-model.js';

/**
 * @classdesc Controller that allows a customer to manage 
 * their shopping basket.
 * @hideconstructor
 */
class BasketController {
    /**
     * Allows customer to retrieve their basket.
     * 
     * @param {Object} req - Represents the HTTP request to receive.
     * @param {Number} req.user.id - Identifies the owner of the basket.
     * @param {Object} res - Represents the HTTP response to return.
     */
    static async getBasket(req, res) {
        const { id: customerId } = req.user;
        const basket = await BasketModel.getBasket(customerId);

        return res.json(basket);
    }

    /**
     * Allows customer to add a product to their basket.
     * 
     * @param {Object} req - Represents the HTTP request to receive.
     * @param {Number} req.user.id - Identifies the owner of
     *  the basket.
     * @param {Number} req.body.productId - Identifies 
     *  the product to be added to basket.
     * @param {Object} res - Represents the HTTP response to return.
     */
    static async addProductToBasket(req, res) {
        const { id: customerId } = req.user;
        const { productId } = req.body;

        try {
            await BasketModel.addProduct(customerId, productId);
        } catch (err) {
            const statusCode = err.cause == 'duplicate' ? 409 : 404;
            return res.status(statusCode).json({
                message: err.message,
                cause: err.cause,
            });
        }

        return res.status(202);
    }

    /**
     * Allows customer to remove a product to their basket.
     * 
     * @param {Object} req - Represents the HTTP request to receive.
     * @param {Number} req.user.id - Identifies the owner of
     *  the basket.
     * @param {Number} req.params.productId - Identifies 
     *  the product to be added to basket.
     * @param {Object} res - Represents the HTTP response to return.
     */
    static async removeProductFromBasket(req, res) {
        const { id: customerId } = req.user;
        const { productId } = req.params;

        try {
            await BasketModel.removeProduct(customerId, productId);
        } catch (err) {
            // if there is NO such product in the customer's basket to remove
            return res.status(404).json({
                error: {
                    message: 'No product to remove',
                },
            });
        }

        // if there EXISTS a product in the customer's basket to remove
        return res.status(204);
    }

    /**
     * Allows customer to increment or decrement the quantity
     * of a product in their basket.
     * 
     * @param {Object} req - Represents the HTTP request to receive.
     * @param {String} req.body.operation - Operation to
     *  perform (increment / decrement).
     * @param {Number} req.user.id - Identifies the owner of
     *  the basket.
     * @param {Number} req.params.productId - Identifies 
     *  the product to be added to basket.
     * @param {Object} res - Represents the HTTP response to return.
     */
    static async updateQuantityByOne(req, res) {
        const { operation } = req.body;
        if (operation != 'increment' && operation != 'decrement') {
            return res.status(400).json({
                error: {
                    message: 'invalid operation',
                },
            });
        }

        const { id: customerId } = req.user;
        const { productId } = req.params;
        const currentQuantity = await BasketModel.getQuantity(customerId, productId);

        if (currentQuantity == 0) {
            return res.status(404).json({
                error: {
                    message: 'product does not exist in the basket',
                },
            });
        }

        const newQuantity = currentQuantity + (operation == 'increment' ? 1 : -1);
        try {
            await BasketModel.setQuantity(customerId, productId, newQuantity);
        } catch (err) {
            return res.status(400).json({
                currentQuantity,
                error: {
                    message: 'quantity cannot exceed stock level',
                },
            });
        }

        return res.status(200).json({
            newQuantity,
        });
    }

    /**
     * Allows customer to clear their basket off of any products.
     * 
     * @param {Object} req - Represents the HTTP request to receive.
     * @param {Number} req.user.id - Identifies the owner of
     *  the basket.
     * @param {Object} res - Represents the HTTP response to return.
     */
    static async clearBasket(req, res) {
        const { id: customerId } = req.user;

        try {
            await BasketModel.removeProduct(customerId, productId);
        } catch (err) {
            // if the basket is ALREADY EMPTY
            return res.status(404).json({
                error: {
                    message: 'basket is already empty',
                },
            });
        }

        // if the basket was NOT EMPTY
        return res.status(204);
    }
}

export {
    BasketController,
}