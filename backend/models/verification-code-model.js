import bcrypt from 'bcrypt';
import { pool } from '../db/pool.js';
import { generateRandomCode } from '../utils/random-code-generator.js';

const schema =
    `
CREATE TABLE IF NOT EXISTS verification_code (
    customer_id INT,
    purpose ENUM('verify_account', 'reset_password'),
    code_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL 1 HOUR),

    PRIMARY KEY (customer_id, purpose),
    FOREIGN KEY (customer_id) REFERENCES customer(id)
)
`
await pool.query(schema);

class VerificationCodeModel {

    static PURPOSES = {
        VERIFY_ACCOUNT: 'verify_account',
        RESET_PASSWORD: 'reset_password',
    }

    static #DEFAULT_CODE_LENGTH = 6;
    static #DEFAULT_HASH_SALT = 10;
    static #DEFAULT_EXPIRY_MINUTES = 1;

    static async generate(customerId, purpose, expiryMinutes = this.#DEFAULT_EXPIRY_MINUTES) {
        const code = generateRandomCode(this.#DEFAULT_CODE_LENGTH);
        const hashedCode = await bcrypt.hash(code, this.#DEFAULT_HASH_SALT);

        const query = 'INSERT INTO verification_code(customer_id, purpose, code_hash, expiry_at) '
            + 'VALUES(?, ?, ?, CURRENT_TIMESTAMP + INTERVAL ? MINUTE)';
        await pool.query(query, [customerId, purpose, hashedCode, expiryMinutes]);

        return code;
    }

    static async verify(code, customerId, purpose) {
        const getCodeQuery =
            'SELECT code_hash AS hashedCode, expiry_at AS expiryAt '
            + 'FROM verification_code WHERE customer_id = ? AND purpose = ?';
        const [results] = await pool.query(getCodeQuery, [customerId, purpose]);

        const matchedRecord = await this.#findRecordWithCode(code, results);
        if (!matchedRecord) {
            return {
                success: false,
                reason: 'nonexistent',
            }
        }

        const deleteCodeQuery =
            'DELETE FROM verification_code WHERE customer_id = ? AND code_hash = ?'
        pool.query(deleteCodeQuery, [customerId, matchedRecord.hashedCode]);

        const currentTimeStamp = new Date(Date.now());
        if (matchedRecord.expiryAt < currentTimeStamp) {
            return {
                success: false,
                reason: 'expired',
            }
        }

        return {
            success: true,
        }
    }

    static async #findRecordWithCode(code, records) {
        for (let record of records) {
            const isHashedEquivalent = await bcrypt.compare(String(code), record.hashedCode);
            if (isHashedEquivalent) {
                return record;
            };
        }
        return null;
    }
}

export {
    VerificationCodeModel,
}