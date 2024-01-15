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

async function ensureEmbedMessageTableExists() {
    const createEmbedMessageTableQuery = `
        CREATE TABLE IF NOT EXISTS embed_messages (
            message_id BIGINT PRIMARY KEY
        )
    `;

    try {
        await pool.query(createEmbedMessageTableQuery);
    } catch (error) {
        console.error("Error creating embed_messages table:", error);
        throw error;
    }
}

export async function saveMessageId(messageId) {
    await ensureEmbedMessageTableExists();
    const deleteQuery = 'DELETE FROM embed_messages';
    await pool.query(deleteQuery);
    const query = 'INSERT INTO embed_messages (message_id) VALUES (?) ON DUPLICATE KEY UPDATE message_id = ?';
    await pool.query(query, [BigInt(messageId), BigInt(messageId)]);
}

export async function getMessageId() {
    await ensureEmbedMessageTableExists();
    const query = 'SELECT message_id FROM embed_messages LIMIT 1';
    const [rows] = await pool.query(query);
    return rows.length > 0 ? rows[0].message_id : null;
}

export async function writeToUsers(discordId, robloxId) {
    try {
        await ensureTableExists();

        const query = 'INSERT INTO users (discord_id, roblox_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE roblox_id = ?';
        const values = [BigInt(discordId), parseInt(robloxId), parseInt(robloxId)];
        await pool.query(query, values);
    } catch (error) {
        console.error("Error writing to database users:", error);
        throw error;
    }
}
