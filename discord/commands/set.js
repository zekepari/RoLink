import { SlashCommandBuilder } from 'discord.js';
import { addGuild, addInviteChannel, addSubGuild, deleteGuild, deleteSubGuild, getGroup, getGuild, getRobloxUser, getSubGuilds } from '../../database.js';
import noblox from 'noblox.js'
import { failMessage, successMessage } from '../messages.js';

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

        //assure user is server owner
        if (interaction.guild.ownerId != interaction.user.id) {
            await interaction.reply(failMessage('Set Command', 'You must be the server owner to use this command.'));
            return;
        }

        //assure user is linked
        if (!robloxId) {
            await interaction.reply(failMessage('Set Command', 'Your Roblox account is not linked.'));
            return;
        }

        if (interaction.options.getSubcommand() === 'invite-channel') {
            const channel = interaction.options.getChannel('channel') ?? interaction.channel;
            const groupId = await getGroup(interaction.guild.id);

            if (!groupId) {
                await interaction.reply(failMessage('Set Invite-Channel', 'You must set this server to a group to use this command.'));
                return;
            }

            try {
                await addInviteChannel(interaction.guild.id, channel.id)
                await interaction.reply(successMessage('Set Invite-Channel', 'The invite-channel has been set successfully.'));
            } catch (error) {
                console.error(error);
                await interaction.reply(failMessage('Set Invite-Channel', 'There was an error setting the link-channel. Check if RoLinker can see messages and create invites in that channel.'));
            }
        } else if (interaction.options.getSubcommand() === 'group') {
            await interaction.deferReply({ ephemeral: true })
            const groupId = interaction.options.getInteger('group-id');

            if (groupId === 0) {
                await interaction.editReply(successMessage('Set Group', 'The group has been removed successfully.'));
                await deleteGuild(interaction.guild.id)
            }

            //assure ownership of group
            try {
                const robloxRank = await noblox.getRankInGroup(groupId, robloxId);

                if (robloxRank != 255) {
                    await interaction.editReply(failMessage('Set Group', 'You must be the group owner to use this command.'));
                    return;
                }
            } catch (error) {
                console.error(error)
                await interaction.editReply(failMessage('Set Group', 'There was an error getting your group rank. Please contact support if this problem persists.'));
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
                await interaction.editReply(successMessage('Set Group', 'The group has been set successfully.'));
            } catch (error) {
                console.error(error)
                await interaction.editReply(failMessage('Set Group', 'There was an error setting the group. Please contact support if this problem persists.'));
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