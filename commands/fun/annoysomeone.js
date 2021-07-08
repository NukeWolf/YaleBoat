module.exports = {
    name: "annoy",
    aliases: ["havefun", "hellonearth"],
    description: "Annoy someone with a message",
    usage: "!annoy <target> <time interval> <message>",
    permissions: ["MANAGE_MESSAGES"],

    /**
     * @param  {import 'discord.js'.Message} message
     * @param  {} args
     */
    execute(message, args) {
        if(!message.mentions.users.first() || )
        message.client.annoy = setInterval(function () {
            message.channel.send(
                `${message.mentions.users.first().toString()}, ${args
                    .slice(2)
                    .join(" ")}`
            );
        }, Number(args[1]));
    },
};
