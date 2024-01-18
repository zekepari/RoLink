
import { stateMap } from '../../index.js';
import { generateState } from '../../auth.js';
import { authMessage } from '../messages.js';

export const interactionCreate = {
    async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
            }
        } else if (interaction.isButton()) {
            if (interaction.customId === 'link') {const state = generateState();
                stateMap.set(state, interaction);
    
                const redirectUri = 'https://rolinker.net/auth';
                const scope = 'openid+profile';
                const authUrl = `https://apis.roblox.com/oauth/v1/authorize?client_id=${process.env.ROBLOX_OAUTH_CLIENT}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&state=${state}`;
    
                await interaction.reply(authMessage(authUrl));
    
                setTimeout(async () => {
                    if (stateMap.has(state)) {
                        stateMap.delete(state);
                    }
                }, 120000);
            }
        }
    }
}