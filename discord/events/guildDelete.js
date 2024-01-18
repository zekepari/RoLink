import { deleteGuild } from "../../database.js"

export const guildDelete = {
    async execute(guild) {
        deleteGuild(guild.id)
    }
}