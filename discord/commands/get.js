import { SlashCommandBuilder } from 'discord.js';
import { getGroup, getSubGuilds, getRobloxUser } from '../../database.js';
import { failMessage, successMessage } from '../messages.js';

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
                .setDescription("get invited to any sub-group servers you're apart of")
        ),
    async execute(interaction) {
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
            const subGroupIds = getSubGuilds(interaction.guild.id);

            if (subGroupIds.length !== 0) {

            } else {
                await interaction.reply(failMessage('Get Sub-Groups', 'No sub-groups exist for this server.'));
                return;
            }
        }
    }
}