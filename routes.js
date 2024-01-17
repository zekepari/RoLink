import { getUserInfo, exchangeCodeForToken } from './auth.js';
import { writeToUsers, getDiscordFromRoblox, getRobloxFromDiscord } from './database.js';
import { stateMap } from './index.js';
import { failMessage, successMessage } from './discord/messages.js';

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

            res.redirect('/auth/success');
            await interaction.editReply(successMessage('Authorization', 'Your Discord and Roblox accounts have been linked successfully.'))
        } catch (error) {
            res.redirect('/auth/error');
            await interaction.editReply(failMessage('Authorization', 'There was an error linking your Discord and Roblox accounts.'))
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

    app.get('/get-roles', async (req, res) => {
        const { id } = req.query
        if (!id) {
            res.status(400).json({ error: "Discord ID is required" });
            return;
        }

        try {
            const robloxId = await getRobloxFromDiscord(id);
            if (robloxId) {
                // get roles logic
            } else {
                res.status(404).json({ error: "No Roblox ID found for the provided Discord ID" });
            }
        } catch (error) {
            console.error("Error in /get-roles:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    })

    app.get('/get-divisions', async (req, res) => {
        const { id } = req.query
        if (!id) {
            res.status(400).json({ error: "Discord ID is required" });
            return;
        }

        try {
            const robloxId = await getRobloxFromDiscord(id);
            if (robloxId) {
                // get divisions logic
            } else {
                res.status(404).json({ error: "No Roblox ID found for the provided Discord ID" });
            }
        } catch (error) {
            console.error("Error in /get-divisions route:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    })
}
