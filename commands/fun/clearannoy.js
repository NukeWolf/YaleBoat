module.exports = {
    name: "clearannoy",
    aliases: [],
    description: "Annoy someone with a message",
    usage: "!clearannoy",
    permissions: ["MANAGE_MESSAGES"],
    ignore: true,

    /**
     * @param  {import 'discord.js'.Message} message
     * @param  {} args
     */
    execute(message, args) {
        clearInterval(message.client.annoy);
    },
};
