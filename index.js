import { Client, GatewayIntentBits } from 'discord.js';
import express from 'express';
import dotenv from 'dotenv';
import discordBot from './discordBot.js';
import setupRoutes from './routes.js';

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
const app = express(express.json());

discordBot(client);
setupRoutes(app);

app.listen(3000, () => {
    console.log('Listening on port 3000')
})