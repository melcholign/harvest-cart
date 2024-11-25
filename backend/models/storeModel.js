import { pool } from '../db/pool.js';

class StoreModel {
    static async getAll() {
        const query =
            `SELECT * FROM store;`;

        try {
            const [results, fields] = await pool.query(query);
            return results;
        } catch (err) {
            console.log("Error executing query:" + err);
            throw err;
        }
    }

    static async searchByName(search_string) {
        const query =
            `SELECT *
        FROM store s
        WHERE s.store_name LIKE '%${search_string}%'
        ORDER BY
          CASE
            WHEN s.store_name LIKE '${search_string}' THEN 0
            WHEN s.store_name LIKE '${search_string}%' THEN 1
            WHEN s.store_name LIKE '%${search_string}' THEN 2
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

    static async searchByCategories(categories) {

        let conditionString = `p.category = '` + categories[0] + `' `;
        for (let i = 1; i < categories.length; i++) {
            conditionString += `OR p.category = '` + categories[i] + `' `;
        }

        const query =
            `SELECT *
        FROM store s
        INNER JOIN product p ON s.store_id = p.store_id
        WHERE ${conditionString}
        ORDER BY s.rating DESC;`

        try {
            const [results, fields] = await pool.query(query);
            return results;
        } catch (err) {
            console.log("Error executing query:" + err);
            throw err;
        }
    }

    static async getByFarmer(farmer_id) {
        const query =
            `SELECT *
        FROM store s
        WHERE s.farmer_id = ${farmer_id};`;

        try {
            const [results, fields] = await pool.query(query);
            return results;
        } catch (err) {
            console.log("Error executing query:" + err);
            throw err;
        }
    }

    static async getByID(store_id) {
        const query =
            `SELECT *
        FROM store s
        WHERE s.store_id = ${store_id};`;

        try {
            const [results, fields] = await pool.query(query);
            return results[0];
        } catch (err) {
            console.log("Error executing query:" + err);
            throw err;
        }
    }

    static async create(farmer_id, store_name, description, gallery_imgs_path, cover_img_path) {
        const query =
            `INSERT INTO store (farmer_id, store_name, description, gallery_imgs_path, cover_img_path)
        VALUES ('${farmer_id}', '${store_name}', '${description}', '${gallery_imgs_path}', '${cover_img_path}');`;

        try {
            const [results, fields] = await pool.query(query);
            return results;
        } catch (err) {
            console.log("Error executing query:" + err);
            throw err;
        }
    }


    static async update(store_id, store_name, description, gallery_imgs_path, cover_img_path) {
        const query =
            `UPDATE store
         SET store_name = '${store_name}',
             description = '${description}',
             gallery_imgs_path = '${gallery_imgs_path}',
             cover_img_path = '${cover_img_path}'
         WHERE store_id = ${store_id};`;

        try {
            const [results, fields] = await pool.query(query);
            return results;
        } catch (err) {
            console.log("Error executing query:" + err);
            throw err;
        }
    }

    static async delete(store_id) {
        const query =
            `DELETE FROM store
         WHERE store_id = ${store_id};`

        try {
            const [results, fields] = await pool.query(query);
            return results;
        } catch (err) {
            console.log("Error executing query:" + err);
            throw err;
        }
    }
}


// testing (PASSED)
if (0) { console.log(await StoreModel.getAll()); }
if (0) { console.log(await StoreModel.getByID(2)); }
if (0) { console.log(await StoreModel.create(6, 'Slaughterer of all Poultry', 'am chimken seller. all chimken country-raised. very much health :>', 'woejwe/jwgjw', 'owjiowfjjgrgo/efwioj')); }
if (0) { console.log(await StoreModel.create(4, 'Abduls Groceries', 'Get the freshest groceries grown with care and love on our farmlands in countryside Sylhet.', 'oqjofjw/ifj.png', 'wtowffwe.jpeg')); }
if (0) { console.log(await StoreModel.delete(1)); }
if (0) { console.log(await StoreModel.update(1, 'edited Groceries', 'Get the edited groceries grown with care and love from our farmlands in edited edited.', 'edited/ifj.png', 'edited')); }


// getByName, getByFarmer tests:

export { StoreModel };