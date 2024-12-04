import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.resolve('.', '.env') });

/**
 * Database configuration object used for establishing connections to the database.
 * 
 * @constant
 * @type {Object}
 * @property {number} connectionLimit - The maximum number of concurrent connections.
 * @property {string} host - The host of the database.
 * @property {string} user - The username for database authentication.
 * @property {string} password - The password for the database user.
 * @property {string} database - The name of the database to connect to.
 */

/*
const config = {
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
}
*/

const config = {
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'pass123',
    database: 'cse327_project',
}

export { config };