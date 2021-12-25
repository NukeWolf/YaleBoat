const { mainGuild, chessCategory } = require("../config");
module.exports = {
    name: "clearchess",
    aliases: [],
    description: "",
    permissions: ["ADMINISTRATOR"],
    ignore: true,
    /**
     * @param  {import('discord.js').Message} message
     * @param  {Array<String>} args
     */
    async execute(message, args) {
        const guild = message.client.guilds.resolve(mainGuild);
        const category = guild.channels.resolve(chessCategory);
        /**
         * @param  {import('discord.js').TextChannel} channel
         */
        const setup = async (channel) => {
            const unix = channel.name.match(/[\d]+$/g);
            const role = guild.roles.cache.find((role) => {
                return role.name == `chess${unix}`;
            });
            role.delete();
            channel.delete();
        };
        category.children.forEach(setup);
    },
};
