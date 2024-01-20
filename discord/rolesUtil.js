import noblox from 'noblox.js'
import { client } from '../bot.js';
import { getDiscordUser } from '../database'

export async function updateRoles(guildId, robloxId) {
    const discordId = await getDiscordUser(robloxId);
    const groupId = await getGroup(guildId);

    if (!groupId || !discordId) return false;

    let guild;
    let member;

    try {
        guild = await client.guilds.fetch(guildId);
        member = await guild.members.fetch(discordId);
    } catch {
        return false;
    }

    const groupRoles = await noblox.getRoles(groupId);
    const userRankName = await noblox.getRankNameInGroup(groupId, robloxId);

    const discordRoles = groupRoles.map(groupRole => guild.roles.cache.find(role => role.name === groupRole.name)).filter(role => role);
    const userDiscordRole = discordRoles.find(role => role.name === userRankName);

    if (!userDiscordRole) return false;

    if (!member.roles.cache.has(userDiscordRole.id)) {
        await member.roles.remove(discordRoles.map(role => role.id));
        
        try {
            await member.roles.add(discordRole);
            return true;
        } catch (error) {
            return false;
        }
    } else {
        return false;
    }
}
