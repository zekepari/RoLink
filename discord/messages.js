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
});

export const failMessage = (title, description) => ({
    embeds: [
        new EmbedBuilder()
            .setTitle(`${title} Failed`)
            .setDescription(description)
            .setColor(0xFF0000)
    ],
    components: [],
    ephemeral: true
});

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

export const subGroupsMessage = (inviteObjects) => {
    const embeds = [
        new EmbedBuilder()
            .setTitle('Your Sub-Group Invite Links')
            .setDescription("Click to join a sub-group server you're not already apart of.")
            .setFooter({ text: 'All links will expire in 2 minutes.' })
    ];

    const components = [];
    let actionRow = new ActionRowBuilder();

    inviteObjects.forEach((inviteObj, index) => {
        const button = new ButtonBuilder()
            .setLabel(inviteObj.name)
            

        if (inviteObj.code != null) {
            button.setStyle(ButtonStyle.Link);
            button.setURL(`https://discord.gg/${inviteObj.code}`);
        } else {
            button.setStyle(ButtonStyle.Secondary);
            button.setCustomId(inviteObj.name)
            button.setDisabled(true);
        }

        actionRow.addComponents(button);

        if ((index + 1) % 5 === 0 || index === inviteObjects.length - 1) {
            components.push(actionRow);
            actionRow = new ActionRowBuilder();
        }
    });

    return {
        embeds,
        components,
        ephemeral: true
    };
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