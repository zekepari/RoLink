import { SlashCommandBuilder } from 'discord.js';
import { failMessage, linkMessage, successMessage } from '../messages.js';

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
                await interaction.reply(failMessage('Send Link-Roblox', 'You must be the server owner to use this command.'));
                return;
            }

            try {
                await channel.send(linkMessage);
                await interaction.reply(successMessage('Send Link-Roblox', 'The message link-roblox has been sent successfully.'));
            } catch (error) {
                console.error(error);
                await interaction.reply(failMessage('Send Link-Roblox', 'There was an error sending link-roblox. Check if RoLinker can send messages to that channel.'));
            }
        }
    }
}