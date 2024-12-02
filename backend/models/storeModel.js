import { pool } from '../db/pool.js';


/**
 * SQL schema for the 'store' table.
 */
const schema = 
`
CREATE TABLE IF NOT EXISTS store(
    storeId int NOT NULL AUTO_INCREMENT,
    farmerId int NOT NULL,

    storeName varchar(50) NOT NULL,
    rating float,
    isOpen BOOLEAN NOT NULL,
    description varchar(5000),
    galleryImgsPath varchar(255),
    coverImgPath varchar(255),

    dateCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dateUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY(storeId),
    FOREIGN KEY(farmerId) REFERENCES farmer(farmerId) ON DELETE CASCADE,
    UNIQUE KEY store_AK (storeName,farmerId)
);
`
await pool.query(schema);

class StoreModel {

    /**
     * Get all stores from the database.
     * @returns {Promise<Array>} List of stores.
     * @throws {Error} If query fails.
     */
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

    /**
     * Search stores by name.
     * @param {string} searchString - The name search string.
     * @returns {Promise<Array>} List of matching stores.
     * @throws {Error} If query fails.
     */
    static async searchByName(searchString) {
        const query =
            `SELECT *
        FROM store s
        WHERE s.storeName LIKE '%${searchString}%'
        ORDER BY
          CASE
            WHEN s.storeName LIKE '${searchString}' THEN 0
            WHEN s.storeName LIKE '${searchString}%' THEN 1
            WHEN s.storeName LIKE '%${searchString}' THEN 2
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
     * Search stores by categories.
     * @param {Array<string>} categories - The list of categories.
     * @returns {Promise<Array>} List of matching stores.
     * @throws {Error} If query fails.
     */
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

    /**
     * Get all products of a store.
     * @param {number} storeId - The ID of the store.
     * @returns {Promise<Array>} List of products.
     * @throws {Error} If query fails.
     */
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

    /**
     * Get a store by ID.
     * @param {number} storeId - The ID of the store.
     * @returns {Promise<Object>} The store object.
     * @throws {Error} If query fails.
     */
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

    /**
     * Add a new store.
     * @param {number} farmerId - The ID of the farmer.
     * @param {string} storeName - The name of the store.
     * @param {string} description - The description of the store.
     * @param {string} galleryImgsPath - Path to the gallery images.
     * @param {string} coverImgPath - Path to the cover image.
     * @returns {Promise<Object>} Result of the addition.
     * @throws {Error} If query fails.
     */
    static async add(farmerId, storeName, description, galleryImgsPath, coverImgPath) {
        const query =
            `INSERT INTO store (farmerId, storeName, description, galleryImgsPath, coverImgPath)
        VALUES ('${farmerId}', '${storeName}', '${description}', '${galleryImgsPath}', '${coverImgPath}');`;

        try {
            const [results, fields] = await pool.query(query);
            return results;
        } catch (err) {
            console.log("Error executing query:" + err);
            throw err;
        }
    }

    /**
     * Update a store's information.
     * @param {number} storeId - The ID of the store.
     * @param {string} storeName - The name of the store.
     * @param {string} description - The description of the store.
     * @returns {Promise<Object>} Result of the update.
     * @throws {Error} If query fails.
     */
    static async update(storeId, storeName, description) {
        const query =
            `UPDATE store
         SET storeName = '${storeName}',
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

    /**
     * Delete a store by ID.
     * @param {number} storeId - The ID of the store.
     * @returns {Promise<Object>} Result of the deletion.
     * @throws {Error} If query fails.
     */
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

export { StoreModel };