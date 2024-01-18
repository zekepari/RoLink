import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js';

export const successMessage = (title, description) => ({
    embeds: [
        new EmbedBuilder()
            .setTitle(`${title} Successful`)
            .setDescription(description)
            .setColor(0x00FF00)
    ],
    components: [],
    ephemeral: true
})

export const failMessage = (title, description) => ({
    embeds: [
        new EmbedBuilder()
            .setTitle(`${title} Failed`)
            .setDescription(description)
            .setColor(0xFF0000)
    ],
    components: [],
    ephemeral: true
})

export const linkMessage = {
    embeds: [
        new EmbedBuilder()
            .setTitle('Link Your Roblox Account')
            .setDescription('Click to link your Discord account to your Roblox account.')
    ],
    components: [
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('link')
                .setLabel('Link Roblox')
                .setStyle(ButtonStyle.Success)
        )
    ]
};

export const authMessage = (authUrl) => {
    return {
        embeds: [
            new EmbedBuilder()
                .setTitle('Your Authorization Link')
                .setDescription('Click to authorize RoLinker to access your Roblox user information.')
                .setFooter({ text: 'You will be redirected to apis.roblox.com. This link will expire in 2 minutes.' })
        ],
        components: [
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('Authorize')
                    .setURL(authUrl)
                    .setStyle(ButtonStyle.Link)
            )
        ],
        ephemeral: true,
        fetchReply: true
    };
};