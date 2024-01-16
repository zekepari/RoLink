import { Client, GatewayIntentBits, SlashCommandBuilder, Routes } from 'discord.js';
import { REST } from 'discord.js';
import { setupInteractionHandlers } from './interactions.js';
import dotenv from 'dotenv';

dotenv.config();

export default function setupBot() {
    const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

    client.once('ready', () => {
        console.log(`Logged in as ${client.user.username}`);
    });

    const commands = [
        new SlashCommandBuilder()
            .setName('setlink')
            .setDescription('Sends the link Roblox embed to the current channel')
    ];

    const commandsJSON = commands.map(command => command.toJSON());
    const rest = new REST({version: '9'}).setToken(process.env.DISCORD_BOT_TOKEN);

    rest.put(
        Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
        { body: commandsJSON }
    ).then(() => {
        console.log(`Commands registered globally`);
    }).catch(console.error);

    setupInteractionHandlers(client)

    client.login(process.env.DISCORD_BOT_TOKEN);
}
