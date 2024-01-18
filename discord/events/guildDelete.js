import { delGroupFromGuild } from "../../database.js"

export const guildDelete = {
    async execute(guild) {
        delGroupFromGuild(guild.id)
    }
}