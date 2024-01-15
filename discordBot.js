import { Client, GatewayIntentBits, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js';
import { generateState, completeAuth } from './auth.js';
import dotenv from 'dotenv';

dotenv.config();

export const stateMap = new Map();

export default function setupBot() {
    const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

    client.once('ready', () => {
        console.log(`Logged in as ${client.user.username}`);

        const embed = new EmbedBuilder()
            .setTitle('Link Your Roblox Account')
            .setDescription('Click to link your Discord user to your Roblox account.');

        const button = new ButtonBuilder()
            .setCustomId('link')
            .setLabel('Link Roblox')
            .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder().addComponents(button);

        const channel = client.channels.cache.get('1195675956652802159');
        channel.send({ embeds: [embed], components: [row] });
    });

    client.on('interactionCreate', async interaction => {
        if (!interaction.isButton()) return;

        if (interaction.customId === 'link') {
            const state = generateState();
            stateMap.set(state, interaction);

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

            setTimeout(() => {
                completeAuth(state);
            }, 120000); // 2 minutes
        }
    });

    client.login(process.env.DISCORD_BOT_TOKEN);
}