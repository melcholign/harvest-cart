import { ProductModel } from '../models/product-model.js';
import { OrderModel } from '../models/order-model.js';
import { pool } from '../db/pool.js';

class ProductController {

    /**
     * Allows a customer to rate a product.
     * Validates the rating and checks if the customer is eligible to rate the product.
     * 
     * @param {Object} req - The HTTP request object.
     * @param {Object} req.params - URL parameters.
     * @param {number} req.params.productId - ID of the product to be rated.
     * @param {Object} req.body - Request body.
     * @param {number} req.body.rating - Rating value between 1 and 5.
     * @param {Object} req.user - The authenticated user object.
     * @param {number} req.user.customerId - ID of the customer submitting the rating.
     * @param {Object} res - The HTTP response object.
     */
    static async rateProduct(req, res) {
        const { productId } = req.params;
        const { rating } = req.body;
        const { customerId } = req.user;

        // Validate the rating input
        if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
            return res.status(400).json({
                success: false,
                error: {
                    message: "Invalid rating value. Must be an integer between 1 and 5."
                }
            });
        }

        try {
            // Find the product
            const [product] = await ProductModel.getProducts([productId]);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    error: {
                        message: "Product not found"
                    }
                });
            }

            // Check if customer is eligible to rate the product
            const customerEligible = await ProductController.#isEligibleToRateProduct(
                customerId, productId
            );
            if (!customerEligible) {
                return res.status(403).json({
                    success: false,
                    error: {
                        message: "You can only rate products you have purchased"
                    }
                });
            }

            // Update or add rating
            await ProductModel.rateProduct(pool, productId, customerId, rating);

            // Success response
            res.status(200).json({
                success: true,
                data: {
                    message: "Rating saved successfully"
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: {
                    message: "Internal server error"
                }
            });
        }
    }

    /**
     * Searches, filters, and sorts products based on query parameters.
     * Applies pagination to the results.
     * 
     * @param {Object} req - The HTTP request object.
     * @param {Object} req.query - Query parameters.
     * @param {string} [req.query.name] - Search term for product names.
     * @param {string} [req.query.categories] - Comma-separated list of categories to filter.
     * @param {number} [req.query.minPrice] - Minimum price filter.
     * @param {number} [req.query.maxPrice] - Maximum price filter.
     * @param {number} [req.query.minRating] - Minimum rating filter.
     * @param {number} [req.query.maxRating] - Maximum rating filter.
     * @param {string} [req.query.sortBy] - Field to sort by ("price", "rating", "dateCreated").
     * @param {string} [req.query.order] - Sort order ("ASC" or "DESC").
     * @param {number} [req.query.page=1] - Page number for pagination.
     * @param {number} [req.query.limit=10] - Number of results per page.
     * @param {Object} res - The HTTP response object.
     */


    static async searchProducts(req, res) {
        try {
            const searchQuery = req.query.name || ""; // Search term
            const page = parseInt(req.query.page) || 1; // Current page (default: 1)
            const limit = parseInt(req.query.limit) || 10; // Results per page (default: 10)
            const offset = (page - 1) * limit; // Calculate offset for pagination
            const { category, minPrice, maxPrice, minRating, maxRating, sortBy, order } = req.query;

            // Search products by name
            let results = await ProductModel.searchByName(searchQuery);

            // Filter products based on categories, price range, and rating range
            if (category) {
                results = results.filter(product => product.category == category);
            }

            if (minPrice || maxPrice) {
                results = results.filter(product => {
                    return product.price >= (minPrice || 0) && product.price <= (maxPrice || Number.MAX_VALUE);
                });
            }

            if (minRating || maxRating) {
                results = results.filter(product => {
                    return product.rating >= (minRating || 0) && product.rating <= (maxRating || 5);
                });
            }

            // Sort the results
            if (sortBy) {
                results.sort((a, b) => {
                    if (sortBy === 'price') return a.price - b.price;
                    if (sortBy === 'rating') return a.rating - b.rating;
                    return new Date(a.dateCreated) - new Date(b.dateCreated);
                });
            }

            if (order && order.toUpperCase() === 'DESC') {
                results.reverse();
            }

            // Apply pagination
            const paginatedResults = results.slice(offset, offset + limit);

            res.status(200).json({
                page,
                limit,
                totalResults: results.length,
                totalPages: Math.ceil(results.length / limit),
                data: paginatedResults,
            });
        } catch (err) {
            console.error("Error searching products:", err);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    /**
     * Checks if a customer is eligible to rate a product.
     * Eligibility is based on whether the product was purchased and delivered to the customer.
     * 
     * @param {number} customerId - ID of the customer.
     * @param {number} productId - ID of the product.
     * @returns {Promise<boolean>} - True if the customer is eligible, false otherwise.
     * @private
     */
    static async #isEligibleToRateProduct(customerId, productId) {
        const orders = await OrderModel.getOrdersByCustomer(pool, customerId);
        const deliveredOrders = orders.filter(order => order.orderStatus === 'delivered');

        if (deliveredOrders.length === 0) {
            return false;
        }

        for (let order of deliveredOrders) {
            const orderItems = await OrderModel.getOrderItemsById(pool, order.orderId);
            const matchedItem = orderItems.find((item) => {
                return item.productId == productId;
            });

            if (matchedItem) {
                return true;
            }
        }

        return false;
    }
}

export {
    ProductController,
};
