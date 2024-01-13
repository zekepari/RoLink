import { Client, GatewayIntentBits } from 'discord.js';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({intents: [GatewayIntentBits.Guilds]});
const app = express();

client.once('ready', () => {
    console.log(`Logged in as ${client.user.username}`)
});

client.login(process.env.DISCORD_BOT_TOKEN);

app.listen(3000, () => {
    console.log('hello')
})