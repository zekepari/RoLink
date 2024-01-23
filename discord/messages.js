import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js';

export const messages = {
    notServerOwner: failMessage('You must be the server owner to use this command.'),
    notGroupOwner: failMessage('You must be the group owner to use this command.'),
    notLinked: failMessage('Your Roblox account is not linked.'),
    noGroupSet: failMessage('This server does not have a group set.'),
    noMatchingServerRole: failMessage('No matching server role was found for your rank.'),
    noSubGroupsExist: failMessage('No sub-groups exist for this server.'),
    noSubGroupsToJoin: failMessage('You are already a part of all sub-groups for this server.'),
    getRolesSuccess: successMessage('Your roles have been updated successfully.'),
    getRolesUpToDate: successMessage('Your roles are already up to date.'),
    getRolesError: failMessage('There was an error updating your roles. Check if RoLinker has permission to assign roles to users.'),
    linkRobloxSuccess: successMessage('The message link-roblox has been sent successfully.'),
    linkRobloxError: failMessage('There was an error sending link-roblox. Check if RoLinker can send messages to that channel.'),
    setCommandFailServerOwner: failMessage('You must be the server owner to use this command.'),
    setCommandFailRobloxLinked: failMessage('Your Roblox account is not linked.'),
    setInviteChannelError: failMessage('There was an error setting the link-channel. Check if RoLinker can see messages and create invites in that channel.'),
    setInviteChannelSuccess: successMessage('The invite-channel has been set successfully.'),
    setGroupRemoveSuccess: successMessage('The group has been removed successfully.'),
    setGroupRemoveExistFail: failMessage("The group wasn't linked to begin with."),
    setGroupFailOwnership: failMessage('You must be the group owner to use this command.'),
    setGroupFailRankError: failMessage('There was an error getting your group rank. Please contact support if this problem persists.'),
    setGroupSuccess: successMessage('The group has been set successfully.'),
    setGroupFailSettingGroup: failMessage('There was an error setting the group. Please contact support if this problem persists.'),
    setMainGroupRemoveSuccess: successMessage('The main group has been removed successfully.'),
    setMainGroupRemoveFail: successMessage('This server is not linked to a main group.'),
    setMainGroupFailOwnership: failMessage('You must be the main group owner to use this command.'),
    setMainGroupFailRankError: failMessage('There was an error getting your main group rank. Please contact support if this problem persists.'),
    setMainGroupFailSubGroupsLimit: failMessage('You are at the maximum sub-group limit (25).'),
    setMainGroupFailSubGroupsError: failMessage('There was an error getting the sub-groups. Please contact support if this problem persists.'),
    setMainGroupFailMainGroupError: failMessage('There was an error getting the main group. Please contact support if this problem persists.'),
    setMainGroupSuccess: successMessage('The main group has been set successfully.'),
    setMainGroupFailSettingGroup: failMessage('There was an error setting the main group. Please contact support if this problem persists.'),
};

export const successMessage = (description) => ({
    embeds: [
        new EmbedBuilder()
            .setTitle('Command Successful')
            .setDescription(description)
            .setColor(0x00FF00)
    ],
    components: [],
    ephemeral: true
});

export const failMessage = (description) => ({
    embeds: [
        new EmbedBuilder()
            .setTitle('Command Failed')
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