module.exports = {
    name: "clearannoy",
    aliases: [],
    description: "Annoy someone with a message",
    usage: "!clear annoy",
    permissions: ["MANAGE_MESSAGES"],

    /**
     * @param  {import 'discord.js'.Message} message
     * @param  {} args
     */
    execute(message, args) {
        clearInterval(message.client.annoy);
    },
};
