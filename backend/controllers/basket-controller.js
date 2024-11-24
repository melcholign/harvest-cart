import { BasketModel } from '../models/basket-model.js';
import { ProductModel } from '../models/product-model.js';
import { pool } from '../db/pool.js';
import { mapObjectsByKey } from '../utils/array-to-obj-mapper.js';

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
        let basket = await BasketModel.getBasket(customerId);

        const productIds = basket.map(product => product.id);
        const inventory = await ProductModel.getProducts(productIds);

        const basketMap = mapObjectsByKey(basket, 'id');
        const inventoryMap = mapObjectsByKey(inventory, 'productId');

        const inconsistentProducts = BasketController.#findInconsistentProducts(
            basketMap, inventoryMap
        );

        // update basket
        basket = BasketController.#getConsistentBasket(basketMap, inconsistentProducts);

        // asynchronously update basket info
        for (let product of inconsistentProducts) {
            BasketModel.setQuantity(customerId, product.id, product.newQuantity);
        }

        return res.json({
            basket,
            changes: inconsistentProducts,
        });
    }

    /**
     * Gets a new basket by removing inconsistencies present
     * in its previous state
     * @private
     * 
     * @param {Object} basketMap - map of basket items by id
     * @param {Array<Object>} inconsistentProducts - array of inconsistent 
     * basket items
     * @returns {Array<Object>} - array of basket items with 
     * inconsistencies removed
     */
    static #getConsistentBasket(
        basketMap,
        inconsistentProducts
    ) {
        inconsistentProducts.forEach(product => {
            const { id } = product;

            if (product.newQuantity == 0) {
                delete basketMap[product.id];
                return;
            }

            basketMap[id].quantity = product.newQuantity;
            basketMap[id].aggregatePrice = basketMap[id].unitPrice * product.newQuantity;
        });

        return Object
            .keys(basketMap)
            .map(id => basketMap[id]);
    }

    /**
     * Finds the inconsistencies in those products in the basket whose quantity 
     * is greater than in stock
     * 
     * @private
     * 
     * @param {Object} basketMap - map of basket items by id
     * @param {Object} Inventory - map of inventory items by id
     * @returns {Array<Object>} - list of products whose 
     * quantity in the basket is greater than what's available in its inventory
     */
    static #findInconsistentProducts(basketMap, inventoryMap) {
        const inconsistentProducts = [];

        for (let id in basketMap) {
            if (basketMap[id].quantity > inventoryMap[id].stockQuantity) {
                const product = {
                    id,
                    name: basketMap[id].name,
                    category: basketMap[id].category,
                    oldQuantity: basketMap[id].quantity,
                    newQuantity: inventoryMap[id].stockQuantity,
                }

                delete product.quantity;

                inconsistentProducts.push(product);
            }
        }

        return inconsistentProducts;
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