import { Client, GatewayIntentBits, Collection, Events } from 'discord.js';
import { setCommand } from './commands/set.js'
import dotenv from 'dotenv';
import { interactionCreate } from './events/interactionCreate.js';
import { clientReady } from './events/clientReady.js';
import { guildDelete } from './events/guildDelete.js';

dotenv.config();

export default function setupBot() {
    const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

    client.commands = new Collection();
    client.commands.set(setCommand.data.name, setCommand);

    client.once(Events.ClientReady, (...args) => clientReady.execute(...args));
    client.on(Events.InteractionCreate, (...args) => interactionCreate.execute(...args))
    client.on(Events.GuildDelete, (...args) => guildDelete.execute(...args))

    client.login(process.env.DISCORD_BOT_TOKEN);
}
