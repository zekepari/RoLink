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
    supportBigNumbers: true
});

export async function addGuild(guildId, groupId) {
    try {
        const query = 'INSERT INTO guilds (guild_id, group_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE group_id = ?';
        const values = [BigInt(guildId), parseInt(groupId), parseInt(groupId)];
        await pool.query(query, values);
    } catch (error) {
        throw error;
    }
}

export async function addInviteChannel(guildId, channelId) {
    try {
        const query = 'UPDATE guilds SET invite_channel_id = ? WHERE guild_id = ?';
        const values = [BigInt(channelId), BigInt(guildId)];
        await pool.query(query, values);
    } catch (error) {
        throw error;
    }
}

export async function addSubGuild(parentGuildId, subGuildId) {
    try {
        const query = 'INSERT INTO sub_guilds (parent_guild_id, sub_guild_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE parent_guild_id = ?';
        const values = [BigInt(parentGuildId), BigInt(subGuildId), BigInt(parentGuildId)];
        await pool.query(query, values);
    } catch (error) {
        throw error;
    }
}

export async function addUser(discordId, robloxId) {
    try {
        const query = 'INSERT INTO users (discord_id, roblox_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE roblox_id = ?';
        const values = [BigInt(discordId), parseInt(robloxId), parseInt(robloxId)];
        await pool.query(query, values);
    } catch (error) {
        throw error;
    }
}

export async function getSubGuilds(guildId) {
    try {
        const query = 'SELECT sub_guild_id FROM sub_guilds WHERE parent_guild_id = ?';
        const values = [BigInt(guildId)];
        const [rows] = await pool.query(query, values);

        const groupIds = rows.map(row => row.sub_guild_id);
        return groupIds;
    } catch (error) {
        throw error;
    }
}

export async function getGuild(groupId) {
    try {
        const query = 'SELECT guild_id FROM guilds WHERE group_id = ?';
        const values = [parseInt(groupId)];
        const [rows] = await pool.query(query, values);

        return rows.length > 0 ? rows[0].guild_id : null;
    } catch (error) {
        throw error;
    }
}

export async function getGroup(guildId) {
    try {
        const query = 'SELECT group_id FROM guilds WHERE guild_id = ?';
        const values = [BigInt(guildId)];
        const [rows] = await pool.query(query, values);

        return rows.length > 0 ? rows[0].group_id : null;
    } catch (error) {
        throw error;
    }
}

export async function getInviteChannel(guildId) {
    try {
        const query = 'SELECT invite_channel_id FROM guilds WHERE guild_id = ?';
        const values = [BigInt(guildId)];
        const [rows] = await pool.query(query, values);

        return rows.length > 0 ? rows[0].invite_channel_id : null;
    } catch (error) {
        throw error;
    }
}

export async function deleteGuild(guildId) {
    try {
        let query = 'DELETE FROM sub_guilds WHERE parent_guild_id = (SELECT group_id FROM guilds WHERE guild_id = ?) OR sub_group_id = (SELECT group_id FROM guilds WHERE guild_id = ?)';
        let values = [BigInt(guildId), BigInt(guildId)];
        await pool.query(query, values);


        query = 'DELETE FROM guilds WHERE guild_id = ?';
        values = [BigInt(guildId)];
        const [result] = await pool.query(query, values);

        return result.affectedRows > 0;
    } catch (error) {
        throw error;
    }
}

export async function deleteSubGuild(guildId) {
    try {
        const query = 'DELETE FROM sub_guilds WHERE sub_guild_id = ?';
        const values = [BigInt(guildId)];
        const [result] = await pool.query(query, values);

        return result.affectedRows > 0;
    } catch (error) {
        throw error;
    }
}

export async function getRobloxUser(discordId) {
    try {
        const query = 'SELECT roblox_id FROM users WHERE discord_id = ?';
        const values = [BigInt(discordId)];
        const [rows] = await pool.query(query, values);

        return rows.length > 0 ? rows[0].roblox_id : null;
    } catch (error) {
        throw error;
    }
}

export async function getDiscordUser(robloxId) {
    try {
        const query = 'SELECT discord_id FROM users WHERE roblox_id = ?';
        const values = [BigInt(robloxId)];
        const [rows] = await pool.query(query, values);

        return rows.length > 0 ? rows[0].discord_id : null;
    } catch (error) {
        throw error;
    }
}