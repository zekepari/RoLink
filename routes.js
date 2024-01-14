import { completeAuth, getUserInfo } from './auth.js';
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
            const tokenResponse = await fetch('https://apis.roblox.com/oauth/v1/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    client_id: process.env.ROBLOX_OAUTH_CLIENT,
                    client_secret: process.env.ROBLOX_OAUTH_KEY,
                    grant_type: 'authorization_code',
                    code: code
                })
            });

            const tokenData = await tokenResponse.json();
            const userInfo = await getUserInfo(tokenData.access_token, res);
            console.log(userInfo.sub);
        } catch (error) {
            res.status(500).send('Server error');
        } finally {
            completeAuth(state);
        }
    });
}
