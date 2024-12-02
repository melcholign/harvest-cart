import { pool } from '../db/pool.js';

export async function executeQueries(queries) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        for (let query of queries) {
            await connection.query(query);
        }

        await connection.commit();
    } catch (err) {
        console.log(err);
        await connection.rollback();
    }

    await connection.release();
}