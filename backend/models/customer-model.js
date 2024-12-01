import { pool } from '../db/pool.js';

/**
 * SQL schema for the Customer table.
 * @type {string}
 */
const schema =
    `
CREATE TABLE IF NOT EXISTS Customer (
    customerId INT AUTO_INCREMENT PRIMARY KEY,
    fullName VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phoneNumber VARCHAR(15),
    hashedPassword VARCHAR(255) NOT NULL,
    isVerified BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
`;

/**
 * The Customer model provides methods to interact with the Customer table.
 * @class CustomerModel
 */
class CustomerModel {

    /**
     * Creates a new customer in the database.
     * @async
     * @param {Object} customer - The customer data.
     * @param {string} customer.fullName - The full name of the customer.
     * @param {string} customer.email - The email address of the customer.
     * @param {string} customer.phoneNumber - The phone number of the customer.
     * @param {string} customer.hashedPassword - The hashed password of the customer.
     * @returns {number} The ID of the newly created customer.
     */
    static async create({fullName, email, phoneNumber, hashedPassword}) {
        const query =
            'INSERT INTO '
            + 'Customer (fullName, email, phoneNumber, hashedPassword) '
            + 'VALUES (?, ?, ?, ?)';
        const [{ insertId }] = await pool.query(
            query, [fullName, email, phoneNumber, hashedPassword]
        );

        return insertId;
    }

    /**
     * Updates a customer field in the database.
     * @async
     * @param {number} id - The ID of the customer to update.
     * @param {string} field - The field to update.
     * @param {any} value - The value to set for the field.
     */
    static async update(id, field, value) {
        const query = `UPDATE Customer SET ${field} = ? WHERE id = ?`;
        await pool.query(query, [value, id]);
    }

    /**
     * Retrieves a customer by their email.
     * @async
     * @param {string} email - The email of the customer.
     * @returns {Object} The customer data.
     */
    static async get(email) {
        const query = 'SELECT * FROM Customer WHERE email = ?';
        const [results] = await pool.query(query, [email]);

        return results[0];
    }

    /**
     * Retrieves all customers from the database.
     * @async
     * @returns {Array} A list of all customers.
     */
    static async getAll() {
        const query = 'SELECT * FROM Customer';
        const [results] = await pool.query(query);

        return results;
    }

    /**
     * Deletes a customer from the database.
     * @async
     * @param {number} id - The ID of the customer to delete.
     */
    static async delete(id) {
        const query = 'DELETE FROM Customer WHERE id = ?';
        await pool.query(query, [id]);
    }
}

export { CustomerModel };
