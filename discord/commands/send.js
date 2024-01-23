import { SlashCommandBuilder } from 'discord.js';
import { linkMessage, messages } from '../messages.js';

export const sendCommand = {
    data: new SlashCommandBuilder()
        .setName('send')
        .setDescription('send bot messages')
        .addSubcommand(subcommand =>
            subcommand.setName('link-roblox')
                .setDescription("send the link-roblox message")
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription("the channel you want to send the link-roblox message too"))
        ),
    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'link-roblox') {
            const channel = interaction.options.getChannel('channel') ?? interaction.channel;

            if (interaction.guild.ownerId != interaction.user.id) {
                await interaction.reply(messages.notServerOwner);
                return;
            }

            try {
                await channel.send(linkMessage);
                await interaction.reply(messages.linkRoblox);
            } catch (error) {
                console.error(error);
                await interaction.reply(messages.linkRobloxError);
            }
        }
    }
}