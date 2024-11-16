import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'node:path';
import { config } from './config.js';

dotenv.config({ path: path.resolve('..', '.env') });

const pool = mysql.createPool(config);

export { pool };