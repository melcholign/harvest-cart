import { pool } from '../db/pool.js';

/**
 * SQL schema for the 'farmer' table.
 */
const schemaFarmer =
    `
CREATE TABLE IF NOT EXISTS farmer(
    farmerId int NOT NULL AUTO_INCREMENT,

    firstname varchar(20) NOT NULL,
    lastname varchar(20) NOT NULL,
    gender ENUM('male', 'female', 'other') NOT NULL,
    dob DATE NOT NULL,
    mobile varchar(20) NOT NULL UNIQUE,
    address varchar(50) NOT NULL,
    nidImgPath varchar(255) NOT NULL UNIQUE,
    pfpImgPath varchar(255) NULL UNIQUE,

    email varchar(50) NOT NULL UNIQUE,
    passHash varchar(255) NOT NULL,

    dateCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dateUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY(farmerId)
);
`
/**
 * SQL schema for the 'store' table.
 */
const schemaStore =
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
    FOREIGN KEY(farmerId) REFERENCES farmer(farmerId)
);
`
await pool.query(schemaFarmer);
await pool.query(schemaStore);

class FarmerModel {

    /**
     * Get all farmers from the database.
     * @returns {Promise<Array>} List of farmers.
     * @throws {Error} If query fails.
     */
    static async getAll() {
        const query =
            `SELECT * FROM farmer;`;

        try {
            const [results, fields] = await pool.query(query);
            return results;
        } catch (err) {
            console.log("Error executing query:" + err);
            throw err;
        }
    }

    /**
     * Get a farmer by email.
     * @param {string} email - The email of the farmer.
     * @returns {Promise<Object>} The farmer object.
     * @throws {Error} If query fails.
     */
    static async getByEmail(email) {
        const query =
            `SELECT * 
         FROM farmer f
         WHERE f.email = "${email}";`;

        try {
            const [results, fields] = await pool.query(query);
            return results[0];
        } catch (err) {
            console.log("Error executing query:" + err);
            throw err;
        }
    }

    /**
     * Get a farmer by ID.
     * @param {number} id - The ID of the farmer.
     * @returns {Promise<Object>} The farmer object.
     * @throws {Error} If query fails.
     */
    static async getByID(id) {
        const query =
            `SELECT * 
         FROM farmer f
         WHERE f.farmerId = "${id}";`;

        try {
            const [results, fields] = await pool.query(query);
            return results[0];
        } catch (err) {
            console.log("Error executing query:" + err);
            throw err;
        }
    }


    /**
     * Search farmers by name.
     * @param {string} searchString - The name search string.
     * @returns {Promise<Array>} List of matching farmers.
     * @throws {Error} If query fails.
     */
    static async searchByName(searchString) {
        const query =
            `SELECT *
        FROM farmer f
        WHERE (f.firstname, ' ', f.lastname) LIKE '%${searchString}%'
        ORDER BY
          CASE
            WHEN (f.firstname, ' ', f.lastname) LIKE '${searchString}' THEN 0
            WHEN (f.firstname, ' ', f.lastname) LIKE '${searchString}%' THEN 1
            WHEN (f.firstname, ' ', f.lastname) LIKE '%${searchString}' THEN 2
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
     * Get all stores of a farmer.
     * @param {number} farmerId - The ID of the farmer.
     * @returns {Promise<Array>} List of stores.
     * @throws {Error} If query fails.
     */
    static async getStores(farmerId) {
        const query =
        `SELECT *
        FROM store s
        WHERE s.farmerId = ${farmerId};`;

        try {
            const [results, fields] = await pool.query(query);
            return results;
        } catch (err) {
            console.log("Error executing query:" + err);
            throw err;
        }
    }



    /**
     * Register a new farmer.
     * @param {string} firstname - Farmer's first name.
     * @param {string} lastname - Farmer's last name.
     * @param {string} gender - Farmer's gender.
     * @param {Date} dob - Farmer's date of birth.
     * @param {string} mobile - Farmer's mobile number.
     * @param {string} address - Farmer's address.
     * @param {string} nidImgPath - Path to farmer's NID image.
     * @param {string} pfpImgPath - Path to farmer's profile picture.
     * @param {string} email - Farmer's email address.
     * @param {string} passHash - Hash of farmer's password.
     * @returns {Promise<Object>} Result of the registration.
     * @throws {Error} If query fails.
     */
    static async register(firstname, lastname, gender, dob, mobile, address, nidImgPath, pfpImgPath, email, passHash) {

        const query =
            `INSERT into farmer (firstname, lastname, gender, dob, mobile, address, nidImgPath, pfpImgPath, email, passHash)
         VALUES ('${firstname}', '${lastname}', '${gender}', '${dob}', '${mobile}', '${address}', '${nidImgPath}', '${pfpImgPath}', '${email}', '${passHash}');`;

        try {
            const [results, fields] = await pool.query(query);
            return results;
        } catch (err) {
            console.log("Error executing query:" + err);
            throw err;
        }
    }

    /**
     * Update a farmer's information.
     * @param {string} firstname - Farmer's first name.
     * @param {string} lastname - Farmer's last name.
     * @param {string} gender - Farmer's gender.
     * @param {Date} dob - Farmer's date of birth.
     * @param {string} mobile - Farmer's mobile number.
     * @param {string} address - Farmer's address.
     * @param {string} email - Farmer's email address.
     * @param {string} passHash - Hash of farmer's password.
     * @param {number} farmerId - ID of the farmer to update.
     * @returns {Promise<Object>} Result of the update.
     * @throws {Error} If query fails.
     */
    static async update(firstname, lastname, gender, dob, mobile, address, email, passHash, farmerId) {
        const query =
            `UPDATE farmer
         SET firstname = '${firstname}', 
         lastname = '${lastname}', 
         gender = '${gender}', 
         dob = '${dob}', 
         mobile = '${mobile}',
         address = '${address}',
         email = '${email}',
         passHash = '${passHash}'
         WHERE farmerId = ${farmerId};`;

        try {
            const [results, fields] = await pool.query(query);
            return results;
        } catch (err) {
            console.log("Error executing query:" + err);
            throw err;
        }
    }


    /**
     * Delete a farmer by ID.
     * @param {number} farmerId - ID of the farmer to delete.
     * @returns {Promise<Object>} Result of the deletion.
     * @throws {Error} If query fails.
     */
    static async delete(farmer_ID) {
        const query =
            `DELETE FROM farmer
        WHERE farmerId = '${farmer_ID}';`;

        try {
            const [results, fields] = await pool.query(query);
            return results;
        } catch (err) {
            console.log("Error executing query:" + err);
            throw err;
        }

    }
}

export { FarmerModel };