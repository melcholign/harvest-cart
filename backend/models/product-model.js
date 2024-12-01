import { pool } from '../db/pool.js';
import { loadSchema } from '../utils/schema-loader.js';


/**
 * SQL schema for the 'Product' table.
 */
const schema =
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
    rating DOUBLE(3,2),
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
await loadSchema(pool, schema, 'Product');

class ProductModel {

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
     * Gets list of specific products whose ids are provided in an 
     * array as the argument, or all products if nothing is passed
     * to the method
     * 
     * @param {Array<Number> | undefined} productIds - list of ids or nothing
     * @returns {Array<Object>} - list of products
     */
    static async getProducts(productIds) {
        // if no array is provided, then return all products
        if (!productIds) {
            let query = 'SELECT * FROM Product';
            const [results] = await pool.query(query);
            return results;
        }

        // if an empty array is provided, then return back an empty array
        if (productIds.length == 0) {
            return [];
        }

        // if array contains one or more ids

        const commaDelimitedIds = productIds.join(',');
        const query = `SELECT * FROM Product WHERE productId in (${commaDelimitedIds})`;
        const [results] = await pool.query(query);
        return results;
    }


    /**
     * Search products by name.
     * @param {string} searchString - The name search string.
     * @returns {Promise<Array<Object>>} List of matching products.
     * @throws {Error} If query fails.
     */
    static async searchByName(search_string){
        const query =
            `SELECT *
        FROM product p
        WHERE p.productName LIKE '%${search_string}%'
        ORDER BY
          CASE
            WHEN p.productName LIKE '${search_string}' THEN 0
            WHEN p.productName LIKE '${search_string}%' THEN 1
            WHEN p.productName LIKE '%${search_string}' THEN 2
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
     * Search products by categories.
     * @param {Array<string>} categories - The list of categories.
     * @returns {Promise<Array<Object>>} List of matching products.
     * @throws {Error} If query fails.
     */
    static async searchByCategories(categories){

        let conditionString = `p.category = '` + categories[0] + `' `;
        for (let i = 1; i < categories.length; i++) {
            conditionString += `OR p.category = '` + categories[i] + `' `;
        }

        const query =
            `SELECT *
        FROM product p
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
        FROM product
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
        `DELETE FROM product
         WHERE productId = ${productId};`

        try {
            const [results, fields] = await pool.query(query);
            return results;
        } catch (err) {
            console.log("Error executing query:" + err);
            throw err;
        }
    }
}

export {
    ProductModel,
}