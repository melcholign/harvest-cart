import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.resolve('..', '.env') });

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
    database: 'cse327_project'
}

export { config };