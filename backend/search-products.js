const express = require('express');
const app = express();

/**
 * Dummy Products class with a static method for finding products.
 * Represents the product schema with basic fields like name, category, price, etc.
 */
class Product {
    /*
     * Product schema includes:
     * - name: Name of the product (String)
     * - category: Category of the product (String)
     * - price: Price of the product (Number)
     * - rating: Rating of the product (Number, 0 to 5)
     * - created_at: Creation date of the product (String in ISO format)
     */

    /**
     * Finds products by name.
     * @param {string} name - The name or partial name of the product to search for.
     * @returns {Promise<Array<Object>>} A promise that resolves to an array of matched products.
     */
    static async find(name) {
        const allProducts = [
            { name: 'Apple', category: 'Fruits', price: 2, rating: 4.5, created_at: '2023-10-01' },
            { name: 'Orange', category: 'Fruits', price: 3, rating: 4.0, created_at: '2023-08-15' },
            { name: 'Carrot', category: 'Vegetables', price: 1, rating: 4.7, created_at: '2023-09-10' },
        ];
        return allProducts.filter(product => product.name.toLowerCase().includes(name.toLowerCase()));
    }
}

/**
 * API endpoint to search for products.
 * @route GET /search
 * @queryparam {string} name - The name or partial name of the product to search for (required).
 * @queryparam {string} [filterType] - Type of filter to apply (e.g., "category", "price", "rating").
 * @queryparam {string} [filter] - The filter value (e.g., "Fruits", "1-5").
 * @queryparam {string} [sortType] - Type of sorting to apply (e.g., "price", "rating", "release_date").
 * @queryparam {string} [sort] - Sorting order (e.g., "asc" for ascending, "desc" for descending).
 * @returns {Object} JSON response containing filtered and sorted products.
 */
app.get('/search', async (req, res) => {
    const { name, filterType, filter, sortType, sort } = req.query;

    // Validate input
    if (!name) {
        return res.status(400).json({ error: 'Product name is required' });
    }

    try {
        // Find products by name
        let products = await Product.find(name);

        // Apply filters
        if (filterType && filter) {
            switch (filterType) {
                case 'category':
                    products = products.filter(product => product.category === filter);
                    break;
                case 'price':
                    const [minPrice, maxPrice] = filter.split('-').map(Number);
                    products = products.filter(product => product.price >= minPrice && product.price <= maxPrice);
                    break;
                case 'rating':
                    const [minRating, maxRating] = filter.split('-').map(Number);
                    products = products.filter(product => product.rating >= minRating && product.rating <= maxRating);
                    break;
                default:
                    return res.status(400).json({ error: 'Invalid filter type' });
            }
        }

        // Apply sorting
        if (sortType && sort) {
            products.sort((a, b) => {
                switch (sortType) {
                    case 'price':
                        return sort === 'asc' ? a.price - b.price : b.price - a.price;
                    case 'rating':
                        return sort === 'asc' ? a.rating - b.rating : b.rating - a.rating;
                    case 'release_date':
                        return sort === 'asc'
                            ? new Date(a.created_at) - new Date(b.created_at)
                            : new Date(b.created_at) - new Date(a.created_at);
                    default:
                        return 0;
                }
            });
        }

        // Return the result
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

/**
 * Starts the Express server.
 * @listens {number} 3000 - The port number on which the server runs.
 */
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
