const Discord = require("discord.js");

module.exports = {
    name: "setconfig",
    aliases: ["config"],
    description:
        "Sets guild specific config values. Only use if you know what you are doing.",
    permissions: ["ADMINISTRATOR"],
    ignore: true,
    async execute(message, args) {
        if (args.length < 2) return message.reply("Not enough arguments");
        const action = args[0];
        const Guilds = message.client.db.Guilds;
        const guildDB = await Guilds.findByPk(message.guild.id);
        //TODO: Setup dynamic loading so the bot doesn't have to restart for new changes to come into place.
        switch (action) {
            case "roleChannel":
                guildDB.config.stateManagerConfig =
                    guildDB.config.stateManagerConfig || {};
                guildDB.config.stateManagerConfig.roleChannel = args[1];
                guildDB.changed("config", true);
                break;
            case "stateMessages":
                guildDB.config.stateManagerConfig =
                    guildDB.config.stateManagerConfig || {};
                guildDB.config.stateManagerConfig.messages = args.slice(1);
                guildDB.changed("config", true);
                break;
            case "logChannel":
                guildDB.config.logChannel = args[1];
                guildDB.changed("config", true);
                break;
            case "yaleReact":
                guildDB.config.yaleReact = args[1];
                guildDB.changed("config", true);
                break;
            case "admittedRole":
                guildDB.config.admittedRole = args[1];
                guildDB.changed("config", true);
                break;
            default:
                return message.channel.send("Invalid Property");
        }
        guildDB.save();
        message.guild.config = guildDB.get("config");
        message.client.log(
            "info",
            `New Config : ${JSON.stringify(guildDB.config)}`,
            message.guild
        );
        //
    },
};
