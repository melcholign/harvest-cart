import { pool } from '../db/pool.js';
import { loadSchema } from '../utils/schema-loader.js';

const schema =
    `
CREATE TABLE IF NOT EXISTS Product (
    productId INT NOT NULL AUTO_INCREMENT,
    -- storeId INT NOT NULL,

    productName VARCHAR(50) NOT NULL,
    description VARCHAR(1000),
    category ENUM(
        'fruits', 'vegetables', 'herbs', 'dairy', 
        'poultry', 'seafood', 'red meat', 'fish',
        'grains', 'condiments', 'spices & seasonings',
        'miscellaneous'
    ) NOT NULL DEFAULT 'miscellaneous',
    rating DOUBLE(3,2),
    stockQuantity INT,
    price FLOAT,

    thumbnailImgPath VARCHAR(255),

    dateCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dateUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY(productId)
    -- FOREIGN KEY(storeId) REFERENCES store(storeId),
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
}

export {
    ProductModel,
}