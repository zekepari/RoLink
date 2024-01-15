import { completeAuth, getUserInfo, exchangeCodeForToken } from './auth.js';
import { stateMap } from './discordBot.js';
import mysql from 'mysql2/promise';

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
            const userInfo = await getUserInfo(tokenData.access_token, res);
            console.log(userInfo.sub);
        } catch (error) {
            res.status(500).send('Server error');
        } finally {
            completeAuth(state);
        }
    });
}
