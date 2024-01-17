import { SlashCommandBuilder } from 'discord.js';
import { getRobloxFromDiscord } from '../../database.js';
import noblox from 'noblox.js'
import { linkMessage } from '../messages.js';

export const setCommand = {
    data: new SlashCommandBuilder()
        .setName('set')
        .setDescription('Set link channels and Roblox groups')
        .addSubcommand(subcommand =>
            subcommand.setName('link-channel')
                .setDescription('Link a Discord channel to receive a link Roblox embed')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('The channel you want to send the link Roblox embed to'))
        )
        .addSubcommand(subcommand =>
            subcommand.setName('group')
                .setDescription('Link this server with a Roblox group')
                .addIntegerOption(option =>
                    option.setName('group-id')
                        .setDescription('The group ID you want to link to this Discord server')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('main-group-id')
                        .setDescription('The group ID of your main group (Only use if this is a division Discord server)'))
        ),
    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'link-channel') {
            const channel = interaction.options.getChannel('channel') ?? interaction.channel;

            try {
                await interaction.deferReply();
                await interaction.deleteReply();

                await channel.send(linkMessage());
            } catch (error) {
                console.error(error);
            }
        } else if (interaction.options.getSubcommand() === 'group') {
            const groupId = interaction.options.getInteger('group-id');
            const mainGroupId = interaction.options.getInteger('main-group-id') ?? false;

            if (!mainGroupId) {
                const robloxId = await getRobloxFromDiscord(interaction.user.id)

                if (robloxId) {

                } else {

                }
                //write to MYSQL table 'main_groups' => col1 [primary key]: guild id, col2 [foreign key]: group id
            } else {
                //check if main group id exists in MYSQL table 'main_groups', if so:
                //write to MYSQL table 'division_groups' => col1 [primary key]: guild id, col2: group id, col3 [foreign key]: main group id
            }
        }
    }
}