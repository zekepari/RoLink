import { SlashCommandBuilder } from 'discord.js';
import { getGroup, getSubGuilds, getRobloxUser, getInviteChannel } from '../../database.js';
import { failMessage, inviteMessage, successMessage } from '../messages.js';

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
            const subGuildIds = await getSubGuilds(interaction.guild.id);
        
            if (subGuildIds.length === 0) {
                await interaction.reply(failMessage('Get Sub-Groups', 'No sub-groups exist for this server.'));
                return;
            }
        
            const invitePromises = subGuildIds.map(async subGuildId => {
                const subGuild = await client.guilds.fetch(subGuildId).catch(error => console.error(error));
        
                if (!subGuild || subGuild.members.fetch(interaction.user.id)) return;
        
                const inviteChannelId = await getInviteChannel(subGuildId);
                const inviteChannel = client.channels.cache.get(inviteChannelId);
        
                if (!inviteChannel) return;
        
                return inviteChannel.createInvite({
                    maxAge: 120,
                    maxUses: 1
                }).catch(error => console.error(error));
            });
        
            const invites = (await Promise.all(invitePromises)).filter(invite => invite != null);

            if (invites.length === 0) {
                await interaction.reply(failMessage('Get Sub-Groups', 'There are no sub-group servers for you to join.'));
                return;
            } else {
                interaction.reply(inviteMessage(invites));
            }
        }
    }
}