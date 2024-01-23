import { SlashCommandBuilder } from 'discord.js';
import { addGuild, addInviteChannel, addSubGuild, deleteGuild, deleteSubGuild, getGroup, getGuild, getRobloxUser, getSubGuilds } from '../../database.js';
import noblox from 'noblox.js'
import { failMessage, messages, successMessage } from '../messages.js';

export const setCommand = {
    data: new SlashCommandBuilder()
        .setName('set')
        .setDescription('set up your server')
        .addSubcommand(subcommand =>
            subcommand.setName('invite-channel')
                .setDescription('set a discord channel to invite new players too')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('the channel you want to invite new players too')
                        .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand.setName('group')
                .setDescription('set up this server with a group')
                .addIntegerOption(option =>
                    option.setName('group-id')
                        .setDescription('the group ID you want to link to this server')
                        .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand.setName('main-group')
                .setDescription('set this server to a main group (only use if this is a sub-group server)')
                .addIntegerOption(option =>
                    option.setName('main-group-id')
                        .setDescription('the group ID of your main group')
                        .setRequired(true))
        ),
    async execute(interaction) {
        const robloxId = await getRobloxUser(interaction.user.id);

        if (interaction.guild.ownerId != interaction.user.id) {
            await interaction.reply(messages.notServerOwner);
            return;
        }

        if (!robloxId) {
            await interaction.reply(messages.notLinked);
            return;
        }

        if (interaction.options.getSubcommand() === 'invite-channel') {
            const channel = interaction.options.getChannel('channel') ?? interaction.channel;
            const groupId = await getGroup(interaction.guild.id);

            if (!groupId) {
                await interaction.reply(messages.noGroupSet);
                return;
            }

            try {
                await addInviteChannel(interaction.guild.id, channel.id)
                await interaction.reply(messages.setInviteChannelSuccess);
            } catch (error) {
                console.error(error);
                await interaction.reply(messages.setInviteChannelError);
            }
        } else if (interaction.options.getSubcommand() === 'group') {
            await interaction.deferReply({ ephemeral: true })
            const groupId = interaction.options.getInteger('group-id');

            if (groupId === 0) {
                const deletedGuild = await deleteGuild(interaction.guild.id)

                if (deletedGuild) {
                    await interaction.editReply(messages.setGroupRemoveSuccess);
                } else {
                    await interaction.editReply(messages.setGroupRemoveExistFail);
                }
            }

            try {
                const robloxRank = await noblox.getRankInGroup(groupId, robloxId);

                if (robloxRank != 255) {
                    await interaction.editReply(messages.notGroupOwner);
                    return;
                }
            } catch (error) {
                console.error(error)
                await interaction.editReply(messages.setGroupFailRankError);
                return;
            }

            const groupRoles = await noblox.getRoles(groupId);
            const existingRoles = interaction.guild.roles.cache;

            groupRoles.shift();
            groupRoles.reverse();

            for (const groupRole of groupRoles) {
                if (existingRoles.some(role => role.name === groupRole.name)) return;

                try {
                    await interaction.guild.roles.create({
                        name: groupRole.name,
                    });
                    console.log(`Role created: ${groupRole.name}`);
                } catch (error) {
                    console.error(`Error creating role ${groupRole.name}:`, error);
                }
            }

            try {
                await addGuild(interaction.guild.id, groupId);
                await interaction.editReply(messages.setGroupSuccess);
            } catch (error) {
                console.error(error)
                await interaction.editReply(messages.setGroupFailSettingGroup);
            }
        } else if (interaction.options.getSubcommand() === 'main-group') {
            const mainGroupId = interaction.options.getInteger('main-group-id');

            if (mainGroupId === 0) {
                try {
                    const deletePotentialSubGuild = await deleteSubGuild(interaction.guild.id);
                    if (deletePotentialSubGuild) {
                        await interaction.reply(successMessage('Set Main-Group', 'The main group has been removed successfully.'));
                    } else {
                        await interaction.reply(successMessage('Set Main-Group', 'This server is not linked to a main group.'));
                    }
                    return;
                } catch (error) {
                    console.error(error);
                    await interaction.reply(failMessage('Set Main-Group', 'There was an error removing your main group. Please contact support if this problem persists.'));
                    return;
                }
            }

            //assure ownership of main group
            try {
                const robloxRank = await noblox.getRankInGroup(mainGroupId, robloxId)

                if (robloxRank != 255) {
                    await interaction.reply(failMessage('Set Main-Group', 'You must be the main group owner to use this command.'));
                    return;
                }
            } catch (error) {
                console.error(error);
                await interaction.reply(failMessage('Set Main-Group', 'There was an error getting your main group rank. Please contact support if this problem persists.'));
                return;
            }

            try {
                const mainGuildId = await getGuild(mainGroupId);

                try {
                    const subGuildIds = await getSubGuilds(mainGuildId)

                    if (subGuildIds.length >= 25) {
                        await interaction.reply(failMessage('Set Main-Group', 'You are at the maximum sub-group limit (25).'));
                        return;
                    }
                } catch (error) {
                    console.error(error);
                    await interaction.reply(failMessage('Set Main-Group', 'There was an error getting the sub-groups. Please contact support if this problem persists.'));
                }
            } catch (error) {
                console.error(error);
                await interaction.reply(failMessage('Set Main-Group', 'There was an error getting the main group. Please contact support if this problem persists.'));
            }

            try {
                await addSubGuild(mainGuildId, interaction.guild.id);
                await interaction.reply(successMessage('Set Main-Group', 'The main group has been set successfully.'));
            } catch (error) {
                console.error(error);
                await interaction.reply(failMessage('Set Main-Group', 'There was an error setting the main group. Please contact support if this problem persists.'));
            }
        }
    }
}