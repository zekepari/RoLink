import { REST, Client, GatewayIntentBits, SlashCommandBuilder, Routes } from 'discord.js';
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
            .setName('set')
            .setDescription('Set link channels and Roblox groups')
            .addSubcommand(subcommand =>
                subcommand.setName('link-channel')
                    .setDescription('Link a Discord channel to receive a link Roblox embed')
                    .addChannelOption(option =>
                        option.setName('channel')
                            .setDescription('The channel you want to send the link Roblox embed to')
                    )
            )
            .addSubcommand(subcommand =>
                subcommand.setName('group')
                    .setDescription('Link this server with a Roblox group')
                    .addIntegerOption(option =>
                        option.setName('group-id')
                            .setDescription('The group ID you want to link to this Discord server')
                            .setRequired(true)
                        )
                    .addIntegerOption(option =>
                        option.setName('main-group-id')
                            .setDescription('The group ID of your main group (Only use if this is a division Discord server)')
                        )
            ),
        new SlashCommandBuilder()
            .setName('get')
            .setDescription('Get roles and divisions')
            .addSubcommand(subcommand =>
                subcommand.setName('roles')
                    .setDescription('Obtain your Roblox rank as a Discord role')
            )
            .addSubcommand(subcommand =>
                subcommand.setName('divisions')
                    .setDescription("Access division Discord servers you're a member of")
            )
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
