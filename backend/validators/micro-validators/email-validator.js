import { body } from 'express-validator';
import { pool } from '../../db/pool.js';

/**
 * Creates a validator for email fields.
 *
 * @param {Object} errorMessages - Object containing custom error messages.
 * @param {string} errorMessages.emptyEmail - Message when the email field is empty.
 * @param {string} errorMessages.invalidEmail - Message when the email format is invalid.
 * @param {string} errorMessages.duplicateEmail - Message when the email is already in use.
 * @returns {ValidationChain} An `express-validator` validation chain for email validation.
 */
export default function createEmailValidator({ emptyEmail, invalidEmail, duplicateEmail }) {
    return body('email').trim()
        .notEmpty().withMessage(emptyEmail)
        .isEmail().withMessage(invalidEmail)
        .custom(isUniqueEmail).withMessage(duplicateEmail);
}

/**
 * Custom validator to ensure the email is unique in the database.
 *
 * @param {string} email - The email address to validate.
 * @throws {Error} Throws an error if the email is already in use.
 * @returns {Promise<void>} Resolves if the email is unique.
 */
async function isUniqueEmail(email) {
    const query = 'SELECT email FROM Customer WHERE email = ?';
    const [results] = await pool.query(query, [email]);

    if (results.length !== 0) {
        throw new Error('Email is already in use');
    }
}
