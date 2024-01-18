export const clientReady = {
    async execute(client) {
        console.log(`Logged in as ${client.user.username}`);
    }
}