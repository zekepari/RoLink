import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: 'rolinker_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

async function ensureTableExists() {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            discord_id BIGINT PRIMARY KEY,
            roblox_id INT
        )
    `;

    try {
        await pool.query(createTableQuery);
    } catch (error) {
        console.error("Error creating table:", error);
        throw error;
    }
}

export async function writeToDatabase(discordId, robloxId) {
    try {
        await ensureTableExists();

        const query = 'INSERT INTO users (discord_id, roblox_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE roblox_id = ?';
        const values = [BigInt(discordId), parseInt(robloxId), parseInt(robloxId)];
        await pool.query(query, values);
    } catch (error) {
        console.error("Error writing to database:", error);
        throw error;
    }
}
