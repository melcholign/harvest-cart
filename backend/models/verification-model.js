import bcrypt from 'bcrypt';
import { pool } from '../db/pool.js';
import { generateRandomCode } from '../utils/random-code-generator.js';

const schema =
    `
CREATE TABLE IF NOT EXISTS Verification (
    customerId INT,
    purpose ENUM('verify_account', 'reset_password'),
    hashedCode VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiryAt TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL 1 HOUR),

    PRIMARY KEY (customerId, purpose),
    FOREIGN KEY (customerId) REFERENCES Customer(customerId)
)
`
await pool.query(schema);

class VerificationModel {

    static PURPOSES = {
        VERIFY_ACCOUNT: 'verify_account',
        RESET_PASSWORD: 'reset_password',
    }

    static #DEFAULT_CODE_LENGTH = 6;
    static #DEFAULT_HASH_SALT = 10;
    static #DEFAULT_EXPIRY_MINUTES = 1;

    static async generateCode(customerId, purpose, expiryMinutes = this.#DEFAULT_EXPIRY_MINUTES) {
        const code = generateRandomCode(this.#DEFAULT_CODE_LENGTH);
        const hashedCode = await bcrypt.hash(code, this.#DEFAULT_HASH_SALT);

        const query = 'INSERT INTO Verification(customerId, purpose, hashedCode, expiryAt) '
            + 'VALUES(?, ?, ?, CURRENT_TIMESTAMP + INTERVAL ? MINUTE)';
        await pool.query(query, [customerId, purpose, hashedCode, expiryMinutes]);

        return code;
    }

    static async remove(customerId, purpose) {
        const query = 'DELETE FROM Verification WHERE customerId = ? and purpose = ?';
        await pool.query(query, [customerId, purpose]);
    }

    static async get(customerId, purpose) {
        const query = 'SELECT * FROM Verification WHERE customerId = ? AND purpose = ?';
        const [results] = await pool.query(query, [customerId, purpose]);

        return results[0];
    }
}

export {
    VerificationModel,
}