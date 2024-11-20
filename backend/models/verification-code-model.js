import bcrypt from 'bcrypt';
import { pool } from '../db/pool.js';
import { generateRandomCode } from '../utils/random-code-generator.js';

const schema =
    `
CREATE TABLE IF NOT EXISTS VerificationCode (
    customerId INT,
    purpose ENUM('verify_account', 'reset_password'),
    hashedCode VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiryAt TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL 1 HOUR),

    PRIMARY KEY (customerId, purpose),
    FOREIGN KEY (customerId) REFERENCES customer(id)
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

        const query = 'INSERT INTO VerificationCode(customerId, purpose, hashedCode, expiryAt) '
            + 'VALUES(?, ?, ?, CURRENT_TIMESTAMP + INTERVAL ? MINUTE)';
        await pool.query(query, [customerId, purpose, hashedCode, expiryMinutes]);

        return code;
    }

    static async verify(code, customerId, purpose) {
        const getCodeQuery =
            'SELECT hashedCode AS hashedCode, expiryAt AS expiryAt '
            + 'FROM VerificationCode WHERE customerId = ? AND purpose = ?';
        const [results] = await pool.query(getCodeQuery, [customerId, purpose]);

        const matchedRecord = await this.#findRecordWithCode(code, results);
        if (!matchedRecord) {
            return {
                success: false,
                reason: 'nonexistent',
            }
        }

        const deleteCodeQuery =
            'DELETE FROM VerificationCode WHERE customerId = ? AND hashedCode = ?'
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