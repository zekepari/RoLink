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

export async function getRobloxFromDiscord(discordId) {
    try {
        const query = 'SELECT roblox_id FROM users WHERE discord_id = ?';
        const values = [BigInt(discordId)];
        const [rows] = await pool.query(query, values);

        return rows.length > 0 ? rows[0].roblox_id : null;
    } catch (error) {
        console.error("Error retrieving Roblox ID from database using Discord ID:", error);
        throw error;
    }
}

export async function getDiscordFromRoblox(robloxId) {
    try {
        const query = 'SELECT discord_id FROM users WHERE roblox_id = ?';
        const values = [BigInt(robloxId)];
        const [rows] = await pool.query(query, values);

        return rows.length > 0 ? rows[0].discord_id : null;
    } catch (error) {
        console.error("Error retrieving Discord ID from database using Roblox ID:", error);
        throw error;
    }
}