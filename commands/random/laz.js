const _ = require("lodash");

module.exports = {
    name: "randomlaz",
    aliases: ["laz"],
    description: "Randomly selects a laz",
    async execute(message, args) {
        const guild = await message.client.getMainGuild();
        const role = await guild.roles.cache.find((role) => {
            return role.name == "Laz";
        });
        const lazPeeps = role.members.map((member) => {
            return member.toString();
        });
        return message.channel.send(_.sample(lazPeeps));
    },
};
