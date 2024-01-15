import { completeAuth, getUserInfo, exchangeCodeForToken } from './auth.js';
import { writeToDatabase } from './database.js';
import { stateMap } from './discordBot.js';

export default function setupRoutes(app) {
    app.get('/auth', async (req, res) => {
        const { code, state } = req.query;
        if (!code) {
            res.status(400).send('Auth code not provided');
            return;
        }

        const discordId = stateMap.get(state);
        if (!discordId) {
            res.status(400).send('Invalid state parameter');
            return;
        }
        
        try {
            const tokenData = await exchangeCodeForToken(code);
            const userInfo = await getUserInfo(tokenData.access_token);
            await writeToDatabase(discordId.user.id, userInfo.sub);

            res.redirect('/success');
        } catch (error) {
            res.status(500).send('Server error');
        } finally {
            completeAuth(state);
        }
    });
}
