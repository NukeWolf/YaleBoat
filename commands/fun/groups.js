module.exports = {
    name: "groups",
    aliases: ["group", "groups25", "group25"],
    description: "Doc full of restaurant info.",
    /**
     * @param  {import 'discord.js'.Message} message
     * @param  {} args
     */
    execute(message, args) {
        return message.channel.send(
            "https://docs.google.com/document/d/1N8PsMI8W0KLzu7_4lRjhuiDpBsUSBPjXgW9F03YpbjE/edit?usp=sharing"
        );
    },
};
