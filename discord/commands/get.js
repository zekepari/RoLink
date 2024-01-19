import { SlashCommandBuilder } from 'discord.js';
import { getGroup, getSubGuilds, getRobloxUser, getInviteChannel } from '../../database.js';
import { failMessage, subGroupsMessage } from '../messages.js';
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

        } else if (interaction.options.getSubcommand() === 'sub-groups') {
            interaction.deferReply({ ephemeral: true });
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
                        const member = await subGuild.members.fetch(interaction.user.id);
                        if (member || !inviteChannelId) {
                            return { name: subGuild.name, code: null };
                        }
    
                        const inviteChannel = client.channels.cache.get(inviteChannelId);
                        if (!inviteChannel) {
                            return { name: subGuild.name, code: null };
                        }
    
                        const invite = await inviteChannel.createInvite({
                            maxAge: 120,
                            maxUses: 1
                        });
    
                        return { name: subGuild.name, code: invite?.code };
                    } catch (error) {
                        console.error(error);
                        return { name: subGuild.name, code: null };
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