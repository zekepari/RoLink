import fetch from 'node-fetch';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { stateMap } from './discordBot.js';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: 'rolinker_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
})

async function writeToDatabase(discordId, robloxId) {
    try {
        const query = 'INSERT INTO users (discord_id, roblox_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE roblox_id = ?';
        const values = [discordId, robloxId, robloxId];
        await pool.query(query, values);
    } catch (error) {
        throw error;
    }
}

export function generateState() {
    return crypto.randomBytes(16).toString('hex');
}

export async function completeAuth(state) {
    if (stateMap.has(state)) {
        const interaction = stateMap.get(state);
        try {
            await interaction.deleteReply();
        } catch (error) {
            console.error('Error deleting reply:', error);
        }
        stateMap.delete(state);
    }
}

export async function getUserInfo(accessToken, res) {
    try {
        const userInfoResponse = await fetch('https://apis.roblox.com/oauth/v1/userinfo', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const userInfoData = await userInfoResponse.json();

        if (userInfoResponse.ok) {
            await writeToDatabase(interaction.user.id, userInfoData.sub);

            res.send(userInfoData);
            return userInfoData;
        } else {
            throw new Error('Failed to fetch user info');
        }
    } catch (error) {
        console.error('Error fetching user info:', error);
        res.status(500).send('Error fetching user info');
        return null;
    }
}

export async function exchangeCodeForToken(code) {
    try {
        const tokenResponse = await fetch('https://apis.roblox.com/oauth/v1/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                client_id: process.env.ROBLOX_OAUTH_CLIENT,
                client_secret: process.env.ROBLOX_OAUTH_KEY,
                grant_type: 'authorization_code',
                code: code
            })
        });

        const tokenData = await tokenResponse.json();

        if (tokenResponse.ok) {
            return tokenData;
        } else {
            throw new Error('Failed to exchange code for token');
        }
    } catch (error) {
        console.error('Error exchanging code for token:', error);
        throw error;
    }
}
