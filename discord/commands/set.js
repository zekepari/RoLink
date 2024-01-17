import { SlashCommandBuilder } from 'discord.js';
import { delSubGroupIfExist, getRobloxFromDiscord, writeToGuilds, writeToSubGroups } from '../../database.js';
import noblox from 'noblox.js'
import { failMessage, linkMessage, successMessage } from '../messages.js';

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

            if (interaction.guild.ownerId != interaction.user.id) {
                await interaction.reply(failMessage('Set Group', 'You must be the Discord server owner to use this command.'));
                return
            }

            try {
                await channel.send(linkMessage);
                await interaction.reply(successMessage('Set Link-Channel', 'Your link-channel has been set successfully.'));
            } catch (error) {
                console.error(error)
                await interaction.reply(failMessage('Set Link-Channel', 'There was an error setting the link-channel. Check if RoLinker can send messages to that channel.'));
            }
        } else if (interaction.options.getSubcommand() === 'group') {
            const groupId = interaction.options.getInteger('group-id');
            const mainGroupId = interaction.options.getInteger('main-group-id') ?? false;
            const robloxId = await getRobloxFromDiscord(interaction.user.id);

            //assure ownership of discord
            if (interaction.guild.ownerId != interaction.user.id) {
                await interaction.reply(failMessage('Set Group', 'You must be the Discord server owner to use this command.'));
                return;
            }

            //assure user is linked
            if (!robloxId) {
                await interaction.reply(failMessage('Set Group', 'Your Roblox account is not linked.'));
                return;
            }

            //assure ownership of group(s)
            try {
                const robloxRank = await noblox.getRankInGroup(groupId, robloxId)

                if (robloxRank != 255) {
                    await interaction.reply(failMessage('Set Group', 'You must be the Roblox group owner to use this command.'));
                    return;
                }

                if (mainGroupId) {
                    try {
                        const subRobloxRank = await noblox.getRankInGroup(mainGroupId, robloxId)
                        if (subRobloxRank != 255) {
                            await interaction.reply(failMessage('Set Group', 'You must be the Roblox group owner to use this command.'));
                            return;
                        }
                    } catch (error) {
                        console.error(error)
                        await interaction.reply(failMessage('Set Group', 'There was an error getting your Roblox main group rank. Please contact support if this problem persists.'));
                        return;
                    }
                }
            } catch (error) {
                console.error(error)
                await interaction.reply(failMessage('Set Group', 'There was an error getting your Roblox group rank. Please contact support if this problem persists.'));
                return;
            }

            if (!mainGroupId || mainGroupId === 0) {
                try {
                    await writeToGuilds(interaction.guild.id, groupId);
                    const wasSubGroup = await delSubGroupIfExist(groupId)

                    if (wasSubGroup) {
                        await interaction.reply(successMessage('Set Group', 'Your Roblox group has been set successfully, note that this Roblox group is no longer a sub-group.'));
                    } else {
                        await interaction.reply(successMessage('Set Group', 'Your Roblox group has been set successfully.'));
                    }
                } catch (error) {
                    console.error(error)
                    await interaction.reply(failMessage('Set Group', 'There was an error setting the Roblox group. Please contact support if this problem persists.'));
                }
            } else {
                if (mainGroupId === groupId) {
                    await interaction.reply(failMessage('Set Group', 'You cannot make a group a sub-group of itself.'));
                    return;
                }

                try {
                    await writeToGuilds(interaction.guild.id, groupId);
                    await writeToSubGroups(groupId, mainGroupId)
                    await interaction.reply(successMessage('Set Group', 'Your Roblox sub-group has been set successfully.'));
                } catch (error) {
                    console.error(error)
                    await interaction.reply(failMessage('Set Group', 'There was an error setting the Roblox sub-group. Please contact support if this problem persists.'));
                }
            }
        }
    }
}