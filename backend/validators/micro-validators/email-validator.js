import { body } from 'express-validator';
import { pool } from '../../db/pool.js';

export default function createEmailValidator() {
    return body('email').trim()
        .isEmail().withMessage('Invalid email')
        .custom(isUniqueEmail).withMessage('Email is already in use');
}

async function isUniqueEmail(email) {
    const query = 'SELECT email FROM customer WHERE email = ?';
    const [results] = await pool.query(query, [email]);

    if (results.length != 0) {
        throw new Error('Email is already in use');
    };
}