import { Client, DiscordAPIError, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({intents: [GatewayIntentBits.Guilds]})

client.once('ready', () => {
    console.log(`Logged in as ${client.user.username}`)
});

client.login(process.env.DISCORD_BOT_TOKEN);