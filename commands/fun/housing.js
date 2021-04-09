module.exports = {
    name: "housing",
    aliases: ["house"],
    description: "Doc full of restaurant info.",
    /**
     * @param  {import 'discord.js'.Message} message
     * @param  {} args
     */
    execute(message, args) {
        return message.channel.send(
            "https://yalecollege.yale.edu/first-year-and-new-student-resources/housing-and-advising-information-forms"
        );
    },
};
