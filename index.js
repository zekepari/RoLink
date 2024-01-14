import { Client, GatewayIntentBits, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js';
import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import crypto from 'crypto';

dotenv.config();

const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]});
const app = express(express.json());
const stateMap = new Map();

client.once('ready', () => {
    console.log(`Logged in as ${client.user.username}`);

    const embed = new EmbedBuilder()
        .setTitle('Link Your Roblox Account')
        .setDescription('Click to link your Discord user to your Roblox account.');

    const button = new ButtonBuilder()
        .setCustomId('link')
        .setLabel('Link Roblox')
        .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(button);

    const channel = client.channels.cache.get('1195675956652802159');
    channel.send({ embeds: [embed], components: [row] });
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'link') {
        const state = generateState();
        stateMap.set(state, interaction.user.id);

        const redirectUri = 'https://rolinker.net/auth';
        const scope = 'openid+profile'; 
        const responseType = 'code';

        const authUrl = `https://apis.roblox.com/oauth/v1/authorize?client_id=${process.env.ROBLOX_OAUTH_CLIENT}&redirect_uri=${redirectUri}&scope=${scope}&response_type=${responseType}&state=${state}`

        const embed = new EmbedBuilder()
            .setTitle('Your Authorization Link')
            .setDescription('Click to authorize RoLinker to access your Roblox user information.')
            .setFooter({ text: 'You will be redirected to apis.roblox.com. This link will expire in 2 minutes.' });
        
        const button = new ButtonBuilder()
            .setLabel('Authorize')
            .setURL(authUrl)
            .setStyle(ButtonStyle.Link);

        const row = new ActionRowBuilder().addComponents(button);

        await interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: true,
            fetchReply: true
        });

        setTimeout(async () => {
            await interaction.deleteReply()
            if (stateMap.has(state)) {
                stateMap.delete(state)
            }
        }, 120000)
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);

app.get('/auth', async (req, res) => {
    const { code, state } = req.query;
    if (!code) {
        res.status(400).send('Auth code not provided');
        return;
    }

    const discordId = stateMap.get(state);
    if (!discordId) {
        res.status(400).send('Invalid state parameter');
        return;
    }
    
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

        const userInfo = await getUserInfo(tokenData.access_token, res);
        console.log(userInfo.sub)
    } catch (error) {
        res.status(500).send('Server error');
    } finally {
        stateMap.delete(state);
    }
});

const getUserInfo = async (accessToken, res) => {
    try {
        const userInfoResponse = await fetch('https://apis.roblox.com/oauth/v1/userinfo', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const userInfoData = await userInfoResponse.json();

        res.send(userInfoData);
        return userInfoData;
    } catch (error) {
        res.status(500).send('Error fetching user info');
        return null;
    }
};

function generateState() {
    return crypto.randomBytes(16).toString('hex');
}

app.listen(3000, () => {
    console.log(`Listening on port 3000`)
})