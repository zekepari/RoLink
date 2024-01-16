import { completeAuth, getUserInfo, exchangeCodeForToken } from './auth.js';
import { writeToUsers } from './database.js';
import { stateMap } from './discordBot.js';

export default function setupRoutes(app) {
    app.get('/auth', async (req, res) => {
        const { code, state } = req.query;
        if (!code) {
            res.redirect('/auth/error');
            return;
        }

        const discordId = stateMap.get(state);
        if (!discordId) {
            res.redirect('/auth/error');
            return;
        }
        
        try {
            const tokenData = await exchangeCodeForToken(code);
            const userInfo = await getUserInfo(tokenData.access_token);
            await writeToUsers(discordId.user.id, userInfo.sub);

            res.redirect('/auth/success');
        } catch (error) {
            res.redirect('/auth/error');
        } finally {
            completeAuth(state);
        }
    });
}
