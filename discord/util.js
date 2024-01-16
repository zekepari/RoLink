import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js';

export async function sendLinkEmbed(interaction) {
    const embed = new EmbedBuilder()
        .setTitle('Link Your Roblox Account')
        .setDescription('Click to link your Discord account to your Roblox account.');

    const button = new ButtonBuilder()
        .setCustomId('link')
        .setLabel('Link Roblox')
        .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(button);

    const channel = interaction.channel;
    await channel.send({ embeds: [embed], components: [row] });
}

export async function sendAuthEmbed(interaction, state) {
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

    await interaction.reply({
        embeds: [embed],
        components: [row],
        ephemeral: true,
        fetchReply: true
    });
}