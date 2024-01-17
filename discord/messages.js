import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js';

export function linkMessage() {
    const embed = new EmbedBuilder()
        .setTitle('Link Your Roblox Account')
        .setDescription('Click to link your Discord account to your Roblox account.');

    const button = new ButtonBuilder()
        .setCustomId('link')
        .setLabel('Link Roblox')
        .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(button);

    return { embeds: [embed], components: [row] }
}

export function authSuccessMessage() {
    const embed = new EmbedBuilder()
        .setTitle('Authorization Successful')
        .setDescription('Your Discord and Roblox accounts have been successfully linked.')
        .setColor(0x00FF00);

    return { embeds: [embed], components: [], ephemeral: true }
}

export function authErrorMessage() {
    const embed = new EmbedBuilder()
        .setTitle('Authorization Failed')
        .setDescription('There was an error linking your Discord and Roblox accounts.')
        .setColor(0xFF0000);

    return { embeds: [embed], components: [], ephemeral: true }
}

export function authMessage(state) {
    const redirectUri = 'https://rolinker.net/auth';
    const scope = 'openid+profile';
    const authUrl = `https://apis.roblox.com/oauth/v1/authorize?client_id=${process.env.ROBLOX_OAUTH_CLIENT}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&state=${state}`;

    const embed = new EmbedBuilder()
        .setTitle('Your Authorization Link')
        .setDescription('Click to authorize RoLinker to access your Roblox user information.')
        .setFooter({ text: 'You will be redirected to apis.roblox.com. This link will expire in 2 minutes.' });

    const button = new ButtonBuilder()
        .setLabel('Authorize')
        .setURL(authUrl)
        .setStyle(ButtonStyle.Link);

    const row = new ActionRowBuilder().addComponents(button);

    return {embeds: [embed], components: [row], ephemeral: true, fetchReply: true}
}