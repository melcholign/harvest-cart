import {pool} from '../db/pool.js';

class ProductModel{
    static async getAll(){
        const query =
        `SELECT * FROM product;`;

        try{
            const [results, fields] = await pool.query(query);
            return results;
        } catch(err){
            console.log("Error executing query:" + err);
            throw err;
        }
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

    static async getByStore(store_id){
        const query =
        `SELECT *
        FROM product p
        WHERE p.store_id = ${store_id};`;

        try{
            const [results, fields] = await pool.query(query);
            return results;
        } catch(err){
            console.log("Error executing query:" + err);
            throw err;
        }
    }

    static async getByID(product_id){
        const query =
        `SELECT *
        FROM product p
        WHERE p.product_id = ${product_id};`;

        try{
            const [results, fields] = await pool.query(query);
            return results[0];
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



export {ProductModel};