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


    static async searchByName(search_string){
        const query =
        `SELECT *
        FROM product p
        WHERE p.product_name LIKE '%${search_string}%'
        ORDER BY
          CASE
            WHEN p.product_name LIKE '${search_string}' THEN 0
            WHEN p.product_name LIKE '${search_string}%' THEN 1
            WHEN p.product_name LIKE '%${search_string}' THEN 2
            ELSE 3
          END`;

        try{
            const [results, fields] = await pool.query(query);
            return results;
        } catch(err){
            console.log("Error executing query:" + err);
            throw err;
        }
    }

    static async searchByCategories(categories){

        let conditionString = `p.category = '` + categories[0] + `' `;
        for(let i = 1; i < categories.length; i++){
            conditionString += `OR p.category = '` + categories[i] + `' `;
        }

        const query =
        `SELECT *
        FROM product p
        WHERE ${conditionString}
        ORDER BY p.rating DESC;`

        try{
            const [results, fields] = await pool.query(query);
            return results;
        } catch(err){
            console.log("Error executing query:" + err);
            throw err;
        }
    }


    static async add(store_id, category_id ,product_name, description, price, thumbnail_img_path){
        const query =
        `INSERT INTO product (store_id, category_id ,product_name, description, price, thumbnail_img_path)
        VALUES ('${store_id}', '${category_id}', '${product_name}', '${description}', '${price}', '${thumbnail_img_path}');`;

        try{
            const [results, fields] = await pool.query(query);
            return results;
        } catch(err){
            console.log("Error executing query:" + err);
            throw err;
        }
    }


    static async update(product_id, store_id, category_id ,product_name, description, price){
        // NOTE: no parameter for thumbnail_img_path as path remains same, just img on path is replaced by controller
        const query =
        `UPDATE product
         SET store_id = '${store_id}',
             category_id = '${category_id}',
             product_name = '${product_name}',
             description = '${description}',
             price = '${price}'
         WHERE product_id = ${product_id};`;

         try{
            const [results, fields] = await pool.query(query);
            return results;
        } catch(err){
            console.log("Error executing query:" + err);
            throw err;
        }
    }

    static async delete(product_id){
        const query =
        `DELETE FROM product
         WHERE product_id = ${product_id};`

         try{
            const [results, fields] = await pool.query(query);
            return results;
        } catch(err){
            console.log("Error executing query:" + err);
            throw err;
        }
    }
}

export {
    ProductModel,
}