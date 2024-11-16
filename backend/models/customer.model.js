import { pool } from './../db/pool.js';

const schema =
    `
CREATE TABLE IF NOT EXISTS customer (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(15),
    password_hash VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
`
await pool.query(schema);

class Customer {

    static async create(data) {
        const query =
            'INSERT INTO '
            + 'customer (full_name, email, phone_number, password_hash)'
            + 'VALUES (?, ?, ?, ?)';

        const [{ insertId }] = await pool.query(query, data);

        return insertId;
    }

    static async update(id, field, value) {
        const query = `UPDATE customer SET ${field} = ? WHERE id = ?`;

        await pool.query(query, [value, id]);
    }

    static async get(id) {
        const query = 'SELECT * FROM customer WHERE id = ?';

        const [results] = await pool.query(query, [id]);

        return results[0];
    }

    static async delete(id) {
        const query = 'DELETE FROM customer WHERE id = ?';

        await pool.query(query, [id]);
    }
}

export { Customer };
