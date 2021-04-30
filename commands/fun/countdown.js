module.exports = {
    name: "countdown",
    aliases: ["daysleft"],
    description: "days until first-year move-in 2021",
    /**
     * @param  {import 'discord.js'.Message} message
     * @param  {} args
     */
    async execute(message, args) {
        const today = new Date();
        const cmas = new Date(today.getFullYear(), 07, 27);
        if (today.getMonth() === 08 && today.getDate() > 27) {
            cmas.setFullYear(cmas.getFullYear() + 1);
        }
        const one_day = 1000 * 60 * 60 * 24;
        const whatsLeft =
            Math.ceil((cmas.getTime() - today.getTime()) / one_day) +
            " days left until Move In!";

        return message.channel.send(whatsLeft);
    },
};
