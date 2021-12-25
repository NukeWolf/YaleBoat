module.exports = {
    name: "bdd",
    aliases: ["bulldog"],
    description: "bdd commands",
    ignore: true,
    /**
     * @param  {import 'discord.js'.Message} message
     * @param  {} args
     */
    execute(message, args) {
        switch (args[0]) {
            case "daily":
                message.client.bulldog.dailyMessage();
                break;
        }
    },
};
