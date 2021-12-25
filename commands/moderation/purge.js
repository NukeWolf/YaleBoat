module.exports = {
    name: "ypurge",
    aliases: [],
    description:
        "Mass deletes a number of most recent messages. Can also select a person to only delete.",
    permissions: ["MANAGE_MESSAGES"],
    ignore: true,
    /**
     * @param  {import('discord.js').Message} message
     * @param  {Array<String>} args
     */
    async execute(message, args) {
        if (!args.length || isNaN(args[0]))
            return message.channel.send(
                "Usage: `!purge <number> <@mention> (optional)`"
            );
        const mentioned = message.mentions.users.first();
        if (mentioned) {
            await new Promise((r) => setTimeout(r, 700));
            message.channel.messages.fetch({ limit: 100 }).then((msgs) => {
                //Filter through messages with the same author. Also deletes Rhythm Bots ID
                let deletedMessages = msgs
                    .filter((msg) => {
                        return (
                            msg.author.id === mentioned.id ||
                            msg.author.id === "235088799074484224"
                        );
                    })
                    .array();
                if (deletedMessages.length > args[0]) {
                    deletedMessages = deletedMessages.splice(0, args[0]);
                }
                message.channel.bulkDelete(deletedMessages);
            });
            message.delete();
        } else {
            message.channel.bulkDelete(Number(args[0]) + 1);
        }
    },
};
