import express from 'express';
import dotenv from 'dotenv';
import discordBot from './discord/bot.js';
import setupRoutes from './routes.js';

dotenv.config();

export const stateMap = new Map();

const app = express(express.json());

discordBot();
setupRoutes(app);

app.listen(3000, () => {
    console.log('Listening on port 3000')
})