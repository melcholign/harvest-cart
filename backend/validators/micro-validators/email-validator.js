import { body } from 'express-validator';
import { pool } from '../../db/pool.js';

export default function createEmailValidator({ emptyEmail, invalidEmail, duplicateEmail }) {
    return body('email').trim()
        .notEmpty().withMessage(emptyEmail)
        .isEmail().withMessage(invalidEmail)
        .custom(isUniqueEmail).withMessage(duplicateEmail);
}

async function isUniqueEmail(email) {
    const query = 'SELECT email FROM customer WHERE email = ?';
    const [results] = await pool.query(query, [email]);

    if (results.length != 0) {
        throw new Error('Email is already in use');
    };
}