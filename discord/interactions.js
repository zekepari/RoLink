import { generateState } from '../auth.js';
import { sendLinkEmbed, sendAuthEmbed } from './util.js';
import { stateMap } from '../index.js';

export function setupInteractionHandlers(client) {
    client.on('interactionCreate', async interaction => {
        if (interaction.isCommand() && interaction.commandName === 'setlink') {
            try {
                await interaction.deferReply();
                await interaction.deleteReply();
                await sendLinkEmbed(interaction);
            } catch (error) {
                console.error('Error sending link embed:', error);
            }
        }

        if (interaction.isButton() && interaction.customId === 'link') {
            const state = generateState();
            stateMap.set(state, interaction);

            await sendAuthEmbed(interaction, state);

            setTimeout(async () => {
                if (stateMap.has(state)) {
                    const interaction = stateMap.get(state);
                    try {
                        await interaction.deleteReply();
                    } catch (error) {
                        console.error('Error deleting reply:', error);
                    }
                    stateMap.delete(state);
                }
            }, 120000); // 2 minutes
        }
    });
}
