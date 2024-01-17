import { Client, GatewayIntentBits, Collection, Events } from 'discord.js';
import { setCommand } from './commands/set.js'
import dotenv from 'dotenv';

dotenv.config();

export default function setupBot() {
    const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

    client.once(Events.ClientReady, () => {
        console.log(`Logged in as ${client.user.username}`);
    });

    client.commands = new Collection();
    client.commands.set(setCommand.data.name, setCommand);

    client.on(Events.InteractionCreate, async (interaction) => {
        if (!interaction.isChatInputCommand()) return;
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
    })

    client.login(process.env.DISCORD_BOT_TOKEN);
}
