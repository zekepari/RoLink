import { SlashCommandBuilder } from 'discord.js';
import { addGuild, addLinkChannel, addSubGuild, deleteSubGuild, getGroup, getGuild, getRobloxUser } from '../../database.js';
import noblox from 'noblox.js'
import { failMessage, successMessage } from '../messages.js';

export const setCommand = {
    data: new SlashCommandBuilder()
        .setName('set')
        .setDescription('set up your server')
        .addSubcommand(subcommand =>
            subcommand.setName('invite-channel')
                .setDescription('link a discord channel to invite new players too')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('the channel you want to invite new players too'))
        )
        .addSubcommand(subcommand =>
            subcommand.setName('group')
                .setDescription('link this server with a group')
                .addIntegerOption(option =>
                    option.setName('group-id')
                        .setDescription('the group ID you want to link to this server')
                        .setRequired(true))
        .addSubcommand(subcommand =>
            subcommand.setName('main-group')
                .setDescription('link this server to main group (only use if this is a sub-group server)'))
                .addIntegerOption(option =>
                    option.setName('main-group-id')
                        .setDescription('the group ID of your main group')
                        .setRequired(true))
        ),
    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'invite-channel') {
            const channel = interaction.options.getChannel('channel') ?? interaction.channel;
            const groupId = await getGroup(interaction.guild.id)

            if (interaction.guild.ownerId != interaction.user.id) {
                await interaction.reply(failMessage('Set Invite-Channel', 'You must be the server owner to use this command.'));
                return
            }

            if (!groupId) {
                await interaction.reply(failMessage('Set Invite-Channel', 'You must set this server to a group to use this command.'));
                return
            }

            try {
                await addLinkChannel(interaction.guild.id, channel.id)
                await interaction.reply(successMessage('Set Invite-Channel', 'Your invite-channel has been set successfully.'));
            } catch (error) {
                console.error(error)
                await interaction.reply(failMessage('Set Invite-Channel', 'There was an error setting the link-channel. Check if RoLinker can see messages and create invites in that channel.'));
            }
        } else if (interaction.options.getSubcommand() === 'group') {
            const groupId = interaction.options.getInteger('group-id');
            const mainGroupId = interaction.options.getInteger('main-group-id') ?? false;
            const robloxId = await getRobloxUser(interaction.user.id);

            //assure ownership of discord
            if (interaction.guild.ownerId != interaction.user.id) {
                await interaction.reply(failMessage('Set Group', 'You must be the server owner to use this command.'));
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
                    await interaction.reply(failMessage('Set Group', 'You must be the group owner to use this command.'));
                    return;
                }

                if (mainGroupId) {
                    try {
                        const subRobloxRank = await noblox.getRankInGroup(mainGroupId, robloxId)
                        if (subRobloxRank != 255) {
                            await interaction.reply(failMessage('Set Group', 'You must be the group owner to use this command.'));
                            return;
                        }
                    } catch (error) {
                        console.error(error)
                        await interaction.reply(failMessage('Set Group', 'There was an error getting your main group rank. Please contact support if this problem persists.'));
                        return;
                    }
                }
            } catch (error) {
                console.error(error)
                await interaction.reply(failMessage('Set Group', 'There was an error getting your group rank. Please contact support if this problem persists.'));
                return;
            }

            if (!mainGroupId || mainGroupId === 0) {
                try {
                    await addGuild(interaction.guild.id, groupId);
                    const wasSubGroup = await deleteSubGuild(interaction.guild.id)

                    if (wasSubGroup) {
                        await interaction.reply(successMessage('Set Group', 'Your group has been set successfully, note that this group is no longer a sub-group.'));
                    } else {
                        await interaction.reply(successMessage('Set Group', 'Your group has been set successfully.'));
                    }
                } catch (error) {
                    console.error(error)
                    await interaction.reply(failMessage('Set Group', 'There was an error setting the group. Please contact support if this problem persists.'));
                }
            } else {
                if (mainGroupId === groupId) {
                    await interaction.reply(failMessage('Set Group', 'You cannot make a group a sub-group of itself.'));
                    return;
                }

                try {
                    await addGuild(interaction.guild.id, groupId);
                    const mainGuildId = getGuild(mainGroupId)
                    await addSubGuild(mainGuildId, interaction.guild.id)
                    await interaction.reply(successMessage('Set Group', 'Your sub-group has been set successfully.'));
                } catch (error) {
                    console.error(error)
                    await interaction.reply(failMessage('Set Group', 'There was an error setting the sub-group. Please contact support if this problem persists.'));
                }
            }
        }
    }
}