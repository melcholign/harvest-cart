import { pool } from '../db/pool.js';

const schema =
    `
CREATE TABLE IF NOT EXISTS Customer (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullName VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phoneNumber VARCHAR(15),
    hashedPassword VARCHAR(255) NOT NULL,
    isVerified BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
`
await pool.query(schema);

class CustomerModel {

    static async create({fullName, email, phoneNumber, hashedPassword}) {
        const query =
            'INSERT INTO '
            + 'Customer (fullName, email, phoneNumber, hashedPassword) '
            + 'VALUES (?, ?, ?, ?)';
        const [{ insertId }] = await pool.query(
            query, [fullName, email, phoneNumber, hashedPassword]
        );

        return insertId;
    }

    static async update(id, field, value) {
        const query = `UPDATE Customer SET ${field} = ? WHERE id = ?`;
        await pool.query(query, [value, id]);
    }

    static async get(email) {
        const query = 'SELECT * FROM Customer WHERE email = ?';
        const [results] = await pool.query(query, [email]);

        return results[0];
    }

    static async getAll() {
        const query = 'SELECT * FROM Customer';
        const [results] = await pool.query(query);

        return results;
    }

    static async delete(id) {
        const query = 'DELETE FROM Customer WHERE id = ?';
        await pool.query(query, [id]);
    }

    static async verify(id) {
        const query = 'UPDATE Customer SET isVerified = 1 WHERE id = ?';
        await pool.query(query, [id]);
    }
}

export { CustomerModel };
