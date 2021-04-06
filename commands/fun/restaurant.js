module.exports = {
    name: "restaurants",
    aliases: ["restaurant"],
    description: "Doc full of restaurant info.",
    /**
     * @param  {import 'discord.js'.Message} message
     * @param  {} args
     */
    execute(message, args) {
        return message.channel.send(
            "Some sick food to eat: https://docs.google.com/document/d/1ngXnPsRWBjj5NEvdjCe_ayEF44kDemjmmS3HaYn8Dhg/edit"
        );
    },
};
