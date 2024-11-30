import { pool } from '../db/pool.js';

const schema = 
`
CREATE TABLE IF NOT EXISTS store(
    storeId int NOT NULL AUTO_INCREMENT,
    farmer_id int NOT NULL,

    store_name varchar(50) NOT NULL,
    rating float,
    is_open BOOLEAN NOT NULL,
    description varchar(5000),
    gallery_imgs_path varchar(255),
    cover_img_path varchar(255),

    dateCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dateUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY(storeId),
    FOREIGN KEY(farmer_id) REFERENCES farmer(farmer_id),
    UNIQUE KEY store_AK (store_name,farmer_id)
);
`
await pool.query(schema);

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
        INNER JOIN product p ON s.storeId = p.storeId
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

    
    static async getProducts(storeId){
        const query =
        `SELECT *
        FROM product p
        WHERE p.storeId = ${storeId};`;

        try{
            const [results, fields] = await pool.query(query);
            return results;
        } catch(err){
            console.log("Error executing query:" + err);
            throw err;
        }
    }

    static async getByID(storeId) {
        const query =
            `SELECT *
        FROM store s
        WHERE s.storeId = ${storeId};`;

        try {
            const [results, fields] = await pool.query(query);
            return results[0];
        } catch (err) {
            console.log("Error executing query:" + err);
            throw err;
        }
    }

    static async add(farmer_id, store_name, description, gallery_imgs_path, cover_img_path) {
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


    static async update(storeId, store_name, description) {
        const query =
            `UPDATE store
         SET store_name = '${store_name}',
             description = '${description}'
         WHERE storeId = ${storeId};`;

        try {
            const [results, fields] = await pool.query(query);
            return results;
        } catch (err) {
            console.log("Error executing query:" + err);
            throw err;
        }
    }

    static async delete(storeId) {
        const query =
            `DELETE FROM store
         WHERE storeId = ${storeId};`

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