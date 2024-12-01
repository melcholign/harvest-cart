import bcrypt from 'bcrypt';
import { pool } from '../db/pool.js';
import { generateRandomCode } from '../utils/random-code-generator.js';

/**
 * SQL schema for the Verification table.
 * @type {string}
 */
const schema =
    `
CREATE TABLE IF NOT EXISTS Verification (
    customerId INT,
    purpose ENUM('verify_account', 'reset_password'),
    hashedCode VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiryAt TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL 1 HOUR),

    PRIMARY KEY (customerId, purpose),
    FOREIGN KEY (customerId) REFERENCES Customer(id)
)
`;

/**
 * Loads the Verification schema.
 * @async
 * @function
 */
await pool.query(schema);

/**
 * Class representing the verification-related database operations.
 * @class VerificationModel
 */
class VerificationModel {

    /**
     * Enum for the purposes of verification.
     * @static
     * @readonly
     * @enum {string}
     */
    static PURPOSES = {
        VERIFY_ACCOUNT: 'verify_account',
        RESET_PASSWORD: 'reset_password',
    }

    /** @private */
    static #DEFAULT_CODE_LENGTH = 6;

    /** @private */
    static #DEFAULT_HASH_SALT = 10;

    /** @private */
    static #DEFAULT_EXPIRY_MINUTES = 1;

    /**
     * Generates a verification code for a customer and stores it in the database.
     * @async
     * @param {number} customerId - The ID of the customer.
     * @param {string} purpose - The purpose of the verification (either 'verify_account' or 'reset_password').
     * @param {number} [expiryMinutes=1] - The expiry time in minutes for the verification code.
     * @returns {Promise<string>} Resolves to the generated verification code.
     */
    static async generateCode(customerId, purpose, expiryMinutes = this.#DEFAULT_EXPIRY_MINUTES) {
        const code = generateRandomCode(this.#DEFAULT_CODE_LENGTH);
        const hashedCode = await bcrypt.hash(code, this.#DEFAULT_HASH_SALT);

        const query = 'INSERT INTO Verification(customerId, purpose, hashedCode, expiryAt) '
            + 'VALUES(?, ?, ?, CURRENT_TIMESTAMP + INTERVAL ? MINUTE)';
        await pool.query(query, [customerId, purpose, hashedCode, expiryMinutes]);

        return code;
    }

    /**
     * Removes the verification record for a customer.
     * @async
     * @param {number} customerId - The ID of the customer.
     * @param {string} purpose - The purpose of the verification to remove (either 'verify_account' or 'reset_password').
     */
    static async remove(customerId, purpose) {
        const query = 'DELETE FROM Verification WHERE customerId = ? and purpose = ?';
        await pool.query(query, [customerId, purpose]);
    }

    /**
     * Retrieves the verification record for a customer.
     * @async
     * @param {number} customerId - The ID of the customer.
     * @param {string} purpose - The purpose of the verification to retrieve (either 'verify_account' or 'reset_password').
     * @returns {Promise<object|null>} Resolves to the verification record, or null if none found.
     */
    static async get(customerId, purpose) {
        const query = 'SELECT * FROM Verification WHERE customerId = ? AND purpose = ?';
        const [results] = await pool.query(query, [customerId, purpose]);

        return results[0];
    }
}

export {
    VerificationModel,
}
