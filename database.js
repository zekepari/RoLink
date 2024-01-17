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

export async function writeToGuilds(guildId, groupId) {
    try {
        const query = 'INSERT INTO guilds (guild_id, group_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE group_id = ?';
        const values = [BigInt(guildId), parseInt(groupId), parseInt(groupId)];
        await pool.query(query, values);
    } catch (error) {
        throw error;
    }
}

export async function writeToSubGroups(groupId, mainGroupId) {
    try {
        const query = 'INSERT INTO sub_groups (group_id, main_group_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE main_group_id = ?';
        const values = [parseInt(groupId), parseInt(mainGroupId), parseInt(mainGroupId)];
        await pool.query(query, values);
    } catch (error) {
        throw error;
    }
}

export async function writeToUsers(discordId, robloxId) {
    try {
        const query = 'INSERT INTO users (discord_id, roblox_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE roblox_id = ?';
        const values = [BigInt(discordId), parseInt(robloxId), parseInt(robloxId)];
        await pool.query(query, values);
    } catch (error) {
        throw error;
    }
}

export async function getSubGroupsFromGuild(guildId) {
    try {
        const query = `
            SELECT sg.group_id 
            FROM sub_groups AS sg
            JOIN guilds AS g ON sg.main_group_id = g.group_id
            WHERE g.guild_id = ?;
        `;
        const values = [BigInt(guildId)];
        const [rows] = await pool.query(query, values);

        const groupIds = rows.map(row => row.group_id);
        return groupIds;
    } catch (error) {
        throw error;
    }
}

export async function getGroupFromGuild(guildId) {
    try {
        const query = 'SELECT group_id FROM guilds WHERE guild_id = ?';
        const values = [BigInt(guildId)];
        const [rows] = await pool.query(query, values);

        return rows.length > 0 ? rows[0].roblox_id : null;
    } catch (error) {
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
        throw error;
    }
}