import { REST, Routes, Client, GatewayIntentBits, Collection, Events } from 'discord.js';
import { setCommand } from './commands/set.js'
import dotenv from 'dotenv';
import { interactionCreate } from './events/interactionCreate.js';
import { clientReady } from './events/clientReady.js';
import { guildDelete } from './events/guildDelete.js';
import { getCommand } from './commands/get.js';
import { sendCommand } from './commands/send.js';

dotenv.config();

export default function setupBot() {
    const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
    const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN)

    const commands = [];
    commands.push(setCommand.data.toJSON());
    commands.push(getCommand.data.toJSON());
    commands.push(sendCommand.data.toJSON());

    (async () => {
        try {
            await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
                {body: commands}
            );
        } catch (error) {
            console.error(error)
        }
    })();

    client.once(Events.ClientReady, (...args) => clientReady.execute(...args));
    client.on(Events.InteractionCreate, (...args) => interactionCreate.execute(...args))
    client.on(Events.GuildDelete, (...args) => guildDelete.execute(...args))

    client.login(process.env.DISCORD_BOT_TOKEN);
}
