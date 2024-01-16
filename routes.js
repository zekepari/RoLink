import { EmbedBuilder } from 'discord.js'
import { getUserInfo, exchangeCodeForToken } from './auth.js';
import { writeToUsers, getDiscordFromRoblox, getRobloxFromDiscord } from './database.js';
import { stateMap } from './index.js';

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

    app.get('/discord-to-roblox', async (req, res) => {
        const { id } = req.query;
        if (!id) {
            res.status(400).json({ error: "Discord ID is required" });
            return;
        }

        try {
            const robloxId = await getRobloxFromDiscord(id);
            if (robloxId) {
                res.json({ robloxId });
            } else {
                res.status(404).json({ error: "No Roblox ID found for the provided Discord ID" });
            }
        } catch (error) {
            console.error("Error in /discord-to-roblox route:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });

    app.get('/roblox-to-discord', async (req, res) => {
        const { id } = req.query;
        if (!id) {
            res.status(400).json({ error: "Roblox ID is required" });
            return;
        }

        try {
            const robloxId = await getDiscordFromRoblox(id);
            if (robloxId) {
                res.json({ robloxId });
            } else {
                res.status(404).json({ error: "No Discord ID found for the provided Roblox ID" });
            }
        } catch (error) {
            console.error("Error in /roblox-to-discord route:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    });
}
