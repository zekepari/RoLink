import { SlashCommandBuilder } from 'discord.js';
import { getGroup, getSubGuilds, getRobloxUser, getInviteChannel } from '../../database.js';
import { failMessage, subGroupsMessage, successMessage } from '../messages.js';
import noblox from 'noblox.js'

export const getCommand = {
    data: new SlashCommandBuilder()
        .setName('get')
        .setDescription('get roles & sub-groups')
        .addSubcommand(subcommand =>
            subcommand.setName('roles')
                .setDescription('get your rank as a role')
        )
        .addSubcommand(subcommand =>
            subcommand.setName('sub-groups')
                .setDescription("get invited to any sub-group servers you're not already apart of")
        ),
    async execute(interaction, client) {
        const robloxId = await getRobloxUser(interaction.user.id);
        const groupId = await getGroup(interaction.guild.id);

        //assure user is linked
        if (!robloxId) {
            await interaction.reply(failMessage('Get', 'Your Roblox account is not linked.'));
            return;
        }

        //assure guild has a group
        if (!groupId) {
            await interaction.reply(failMessage('Get', 'This server does not have a group set.'));
            return;
        }

        if (interaction.options.getSubcommand() === 'roles') {
            await interaction.deferReply({ ephemeral: true });
            const userId = interaction.user.id;
        
            const [member, groupRoles] = await Promise.all([
                interaction.guild.members.fetch(userId),
                noblox.getRoles(groupId)
            ]);
        
            const groupRankName = await noblox.getRankNameInGroup(groupId, robloxId);
        
            const existingRoles = interaction.guild.roles.cache;
            const discordRoles = groupRoles.map(groupRole => existingRoles.find(role => role.name === groupRole.name)).filter(role => role);
        
            const discordRole = discordRoles.find(role => role.name === groupRankName);
            
            if (!discordRole) {
                await interaction.editReply(failMessage('Get Roles', 'No matching server role was found for your rank.'));
                return;
            }
        
            if (!member.roles.cache.has(discordRole.id)) {
                await member.roles.remove(discordRoles.map(role => role.id));
                
                try {
                    await member.roles.add(discordRole);
                    await interaction.editReply(successMessage('Get Roles', 'Your roles have been updated successfully.'));
                } catch (error) {
                    await interaction.editReply(failMessage('Get Roles', 'There was an error updating your roles. Check if RoLinker has permission to assign roles to users.'));
                }
            } else {
                await interaction.editReply(failMessage('Get Roles', 'Your roles are already up to date.'));
            }
        } else if (interaction.options.getSubcommand() === 'sub-groups') {
            await interaction.deferReply({ ephemeral: true });
            const subGuildIds = await getSubGuilds(interaction.guild.id);

            if (subGuildIds.length === 0) {
                await interaction.editReply(failMessage('Get Sub-Groups', 'No sub-groups exist for this server.'));
                return;
            }

            const allowedSubGuildIds = (await Promise.all(
                subGuildIds.map(async subGuildId => {
                    const subGroupId = await getGroup(subGuildId);
                    const groupRank = await noblox.getRankInGroup(subGroupId, robloxId);
                    return groupRank !== 0 ? subGuildId : null;
                })
            )).filter(id => id !== null);

            const invites = (await Promise.all(
                allowedSubGuildIds.map(async subGuildId => {
                    const subGuild = await client.guilds.fetch(subGuildId).catch(error => console.error(error));
                    const inviteChannelId = await getInviteChannel(subGuildId);
    
                    try {
                        await subGuild.members.fetch(interaction.user.id);
                        return { name: subGuild.name, code: null };
                    } catch {
                        if (!inviteChannelId) {
                            return { name: subGuild.name, code: null };
                        }
                        const inviteChannel = client.channels.cache.get(inviteChannelId);
                        const invite = await inviteChannel.createInvite({
                            maxAge: 120,
                            maxUses: 1
                        });
                        return { name: subGuild.name, code: invite?.code };
                    }
                })
            ))

            if (invites.length === 0) {
                await interaction.editReply(failMessage('Get Sub-Groups', 'There are no sub-group servers for you to join.'));
                return;
            } else {
                await interaction.editReply(subGroupsMessage(invites));
            }
        }
    }
}