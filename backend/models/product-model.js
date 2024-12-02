import { pool } from '../db/pool.js';
import { loadSchema } from '../utils/schema-loader.js';
/**
 * SQL schema for the Product table.
 * Defines the structure of the Product table, including columns, data types, constraints, 
 * and default values.
 */
const productSchema =
    `
CREATE TABLE IF NOT EXISTS Product (
    productId INT NOT NULL AUTO_INCREMENT,
    storeId INT NOT NULL,

    productName VARCHAR(50) NOT NULL,
    description VARCHAR(1000),
    category ENUM(
        'fruits', 'vegetables', 'herbs', 'dairy', 
        'poultry', 'seafood', 'red meat', 'fish',
        'grains', 'condiments', 'spices & seasonings',
        'miscellaneous'
    ) NOT NULL DEFAULT 'miscellaneous',
    rating NUMERIC(3,2) DEFAULT 0 NOT NULL,
    stockQuantity INT CHECK(stockQuantity >= 0),
    price FLOAT,

    thumbnailImgPath VARCHAR(255),

    dateCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dateUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY(productId),
    FOREIGN KEY(storeId) REFERENCES store(storeId) ON DELETE CASCADE,
    UNIQUE KEY product_AK (productName, storeId)
);
`
// Load the Product schema into the database.

await loadSchema(pool, productSchema, 'Product');
/**
 * SQL schema for the Rating table.
 * Defines the structure of the Rating table, including relationships to other tables.
 */
const ratingSchema = `
CREATE TABLE IF NOT EXISTS Rating (
    productId INT NOT NULL,
    customerId INT NOT NULL,
    rating INT DEFAULT 0 NOT NULL,

    PRIMARY KEY(productId, customerId),
    FOREIGN KEY(productId) REFERENCES Product(productId),
    FOREIGN KEY(customerId) REFERENCES Customer(customerId)
)
`
// Load the Rating schema into the database.

await loadSchema(pool, ratingSchema, 'Rating');
/**
 * Product model class.
 * Defines constants for product categories and provides utility methods related to the Product model.
 */
class ProductModel {

/**
     * Enum for product categories.
     * @readonly
     * @enum {string}
     */

    static CATEGORIES = {
        FRUITS: 'fruit',
        VEGETABLES: 'vegetables',
        HERBS: 'herbs',
        DIARY: 'dairy',
        POULTRY: 'poultry',
        SEAFOOD: 'seafood',
        RED_MEAT: 'red meat',
        FISH: 'fish',
        GRAINS: 'grains',
        CONDIMENTS: 'condiments',
        SPICES_AND_SEASONINGS: 'spices & seasonings',
    }

    /**
     * Retrieves a list of specific products by their IDs or all products if no IDs are provided.
     * 
     * - If no array is provided, all products in the database are returned.
     * - If an empty array is provided, an empty array is returned.
     * - If the array contains IDs, only the products matching those IDs are returned.
     *
     * @param {Array<number> | undefined} productIds - An array of product IDs or undefined.
     * @returns {Promise<Array<Object>>} A promise that resolves to an array of product objects.
     */
    static async getProducts(productIds) {
        // If no array is provided, return all products.
        if (!productIds) {
            const query = 'SELECT * FROM Product';
            const [results] = await pool.query(query);
            return results;
        }

        // If an empty array is provided, return an empty array.
        if (productIds.length === 0) {
            return [];
        }

        // If the array contains one or more IDs, retrieve matching products.
        const commaDelimitedIds = productIds.join(',');
        const query = `SELECT * FROM Product WHERE productId IN (${commaDelimitedIds})`;
        const [results] = await pool.query(query);
        return results;
    }

    /**
     * Searches for products by a given name or partial name.
     * 
     * - Matches products whose names contain the search string.
     * - Results are ordered by the closeness of the match:
     *   1. Exact matches.
     *   2. Names starting with the search string.
     *   3. Names ending with the search string.
     *   4. Other matches.
     *
     * @param {string} searchString - The search string used to match product names.
     * @returns {Promise<Array<Object>>} A promise that resolves to an array of product objects matching the search criteria.
     * @throws {Error} Will throw an error if the query fails.
     */
    static async searchByName(searchString) {
        const query =
            `SELECT *
        FROM Product p
        WHERE p.productName LIKE '%${searchString}%'
        ORDER BY
          CASE
            WHEN p.productName LIKE '${searchString}' THEN 0
            WHEN p.productName LIKE '${searchString}%' THEN 1
            WHEN p.productName LIKE '%${searchString}' THEN 2
            ELSE 3
          END`;

        try {
            const [results, fields] = await pool.query(query);
            return results;
        } catch (err) {
            console.log("Error executing query:" + err);
            throw err;
        }
    }


    /**
     * Retrieves products that belong to specific categories.
     * 
     * - Filters products by the categories provided in the input array.
     * - Results are ordered by the product rating in descending order.
     *
     * @param {Array<string>} categories - An array of category names to filter products by.
     * @returns {Promise<Array<Object>>} A promise that resolves to an array of products matching the given categories.
     * @throws {Error} Will throw an error if the query fails.
     */
    static async searchByCategories(categories) {

        let conditionString = `p.category = '` + categories[0] + `' `;
        for (let i = 1; i < categories.length; i++) {
            conditionString += `OR p.category = '` + categories[i] + `' `;
        }

        const query =
            `SELECT *
        FROM Product p
        WHERE ${conditionString}
        ORDER BY p.rating DESC;`

        try {
            const [results, fields] = await pool.query(query);
            return results;
        } catch (err) {
            console.log("Error executing query:" + err);
            throw err;
        }
    }


    /**
     * Get a product by ID.
     * @param {number} productId - The ID of the product.
     * @returns {Promise<Object>} The product object.
     * @throws {Error} If query fails.
     */
    static async getByID(productId) {
        const query =
            `SELECT *
        FROM Product
        WHERE productId = ${productId};`;

        try {
            const [results, fields] = await pool.query(query);
            return results[0];
        } catch (err) {
            console.log("Error executing query:" + err);
            throw err;
        }
    }

    /**
     * Add a new product.
     * @param {number} storeId - The ID of the store.
     * @param {string} category - The category of the product.
     * @param {string} productName - The name of the product.
     * @param {string} description - The description of the product.
     * @param {number} price - The price of the product.
     * @param {string} thumbnailImgPath - Path to the thumbnail image.
     * @returns {Promise<Object>} Result of the addition.
     * @throws {Error} If query fails.
     */
    static async add(storeId, category ,productName, description, price, thumbnailImgPath){
        const query =
        `INSERT INTO product (storeId, category ,productName, description, price, thumbnailImgPath)
        VALUES ('${storeId}', '${category}', '${productName}', '${description}', '${price}', '${thumbnailImgPath}');`;

        try {
            const [results, fields] = await pool.query(query);
            return results;
        } catch (err) {
            console.log("Error executing query:" + err);
            throw err;
        }
    }

    /**
     * Decreases the stock quantity of a specific product by a given amount.
     * 
     * - Throws an error if the decrease quantity is negative or if the product does not exist.
     * - Validates stock constraints and prevents reducing stock below zero.
     *
     * @param {Object} connection - The database connection object.
     * @param {number} productId - The ID of the product whose stock is to be decreased.
     * @param {number} decreaseByQuantity - The amount by which to decrease the stock.
     * @throws {Error} If the decrease quantity is negative, the product does not exist, or constraints are violated.
     */
    static async decreaseStock(connection, productId, decreaseByQuantity) {
        if (decreaseByQuantity < 0) {
            throw new Error('invalid quantity', { cause: 'negative value' });
        }

        const query = 'UPDATE Product SET stockQuantity = stockQuantity - ? WHERE productId = ?'

        try {
            const [result] = await connection.query(query, [
                decreaseByQuantity, productId
            ]);
            if (result.affectedRows == 0) {
                throw new Error('No such product exists');
            }
        } catch (err) {
            if (err.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
                throw new Error('Stock quantity cannot be reduced by ' + decreaseByQuantity);
            }

            throw err;
        }
    }

    /**
     * Increases the stock quantity of a specific product by a given amount.
     * 
     * - Throws an error if the increase quantity is negative or if the product does not exist.
     *
     * @param {Object} connection - The database connection object.
     * @param {number} productId - The ID of the product whose stock is to be increased.
     * @param {number} increaseByQuantity - The amount by which to increase the stock.
     * @throws {Error} If the increase quantity is negative or the product does not exist.
     */
    static async increaseStock(connection, productId, increaseByQuantity) {
        if (increaseByQuantity < 0) {
            throw new Error('invalid quantity', { cause: 'negative value' });
        }

        const query = 'UPDATE Product SET stockQuantity = stockQuantity + ? WHERE productId = ?'

        const [result] = await connection.query(query, [
            increaseByQuantity, productId
        ]);

        if (result.affectedRows == 0) {
            throw new Error('No such product exists');
        }
    }
    
    /**
     * Update a product's information.
     * @param {number} productId - The ID of the product.
     * @param {string} category - The category of the product.
     * @param {string} productName - The name of the product.
     * @param {string} description - The description of the product.
     * @param {number} price - The price of the product.
     * @returns {Promise<Object>} Result of the update.
     * @throws {Error} If query fails.
     */
    static async update(productId, category ,productName, description, price){
        // NOTE: no parameter for thumbnailImgPath as path remains same, just img on path is replaced by controller
        const query =
        `UPDATE product
         SET category = '${category}',
             productName = '${productName}',
             description = '${description}',
             price = '${price}'
         WHERE productId = ${productId};`;

        try {
            const [results, fields] = await pool.query(query);
            return results;
        } catch (err) {
            console.log("Error executing query:" + err);
            throw err;
        }
    }

    /**
     * Delete a product by ID.
     * @param {number} productId - The ID of the product.
     * @returns {Promise<Object>} Result of the deletion.
     * @throws {Error} If query fails.
     */
    static async delete(productId){
        const query =
        `DELETE FROM Product
         WHERE productId = ${productId};`

        try {
            const [results, fields] = await pool.query(query);
            return results;
        } catch (err) {
            console.log("Error executing query:" + err);
            throw err;
        }
    }



    /**
     * Retrieves the average rating for a specific product.
     * 
     * @param {Object} connection - The database connection object.
     * @param {number} productId - The ID of the product whose rating is to be retrieved.
     * @returns {Promise<Object>} A promise that resolves to an object containing the average rating of the product.
     */
    static async getRating(connection, productId) {
        const query = `SELECT AVG(rating) AS rating FROM Rating WHERE productId = ?`;
        const [results] = await connection.query(query, [productId]);

        return results[0];
    }

    /**
     * Rates a product by a customer or updates an existing rating.
     * 
     * - If the customer has not rated the product, a new rating entry is created.
     * - If the customer has already rated the product, the existing rating is updated.
     * - The average rating of the product is recalculated and updated in the Product table.
     * 
     * @param {Object} connection - The database connection object.
     * @param {number} productId - The ID of the product being rated.
     * @param {number} customerId - The ID of the customer rating the product.
     * @param {number} rating - The rating value provided by the customer.
     * @returns {Promise<void>} A promise that resolves when the rating operation is complete.
     * @throws {Error} If the query fails.
     */
    static async rateProduct(connection, productId, customerId, rating) {
        const hasRatedQuery = 'SELECT rating FROM Rating '
            + 'WHERE productId = ? AND customerId = ?';

        const [results] = await connection.query(hasRatedQuery, [productId, customerId]);

        if (results.length === 0) {
            const addQuery = 'INSERT INTO Rating(productId, customerId, rating) VALUES(?, ?, ?)';
            await connection.query(addQuery, [productId, customerId, rating]);
        } else {
            const updateQuery = 'UPDATE Rating SET rating = ? WHERE productId = ? AND customerId = ?';
            await connection.query(updateQuery, [rating, productId, customerId]);
        }

        const updateAvgQuery = 'UPDATE Product SET rating ='
            + '(SELECT AVG(rating) FROM Rating WHERE productId = ?)';
        await connection.query(updateAvgQuery, [productId]);
    }
}

ProductModel.rateProduct(pool, 1, 7, 4).then(res => console.log('done'));

/**
 * Exports the ProductModel class for use in other modules.
 */
export {
    ProductModel,
}
