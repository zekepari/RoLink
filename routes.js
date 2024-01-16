import { EmbedBuilder } from 'discord.js'
import { getUserInfo, exchangeCodeForToken } from './auth.js';
import { writeToUsers } from './database.js';
import { stateMap } from './discordBot.js';

export default function setupRoutes(app) {
    app.get('/auth', async (req, res) => {
        const { code, state } = req.query;
        if (!code) {
            res.redirect('/auth/error');
            return;
        }

        const interaction = stateMap.get(state);
        if (!interaction) {
            res.redirect('/auth/error');
            return;
        }

        try {
            const tokenData = await exchangeCodeForToken(code);
            const userInfo = await getUserInfo(tokenData.access_token);
            await writeToUsers(interaction.user.id, userInfo.sub);

            const successEmbed = new EmbedBuilder()
                .setTitle('Authorization Successful')
                .setDescription('Your Discord and Roblox accounts have been successfully linked.')
                .setColor(0x00FF00);

            setTimeout(async () => {
                try {
                    await interaction.deleteReply();
                } catch { }
            }, 30000); // 30 seconds

            res.redirect('/auth/success');
            await interaction.editReply({embeds: [successEmbed], components: []})
        } catch (error) {
            const errorEmbed = new EmbedBuilder()
                .setTitle('Authorization Failed')
                .setDescription('There was an error linking your Discord and Roblox accounts.')
                .setColor(0xFF0000);

            setTimeout(async () => {
                try {
                    await interaction.deleteReply();
                } catch { }
            }, 30000); // 30 seconds

            res.redirect('/auth/error');
            await interaction.editReply({embeds: [errorEmbed], components: []})
        } finally {
            stateMap.delete(state);
        }
    });
}
