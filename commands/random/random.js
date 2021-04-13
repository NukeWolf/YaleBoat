const _ = require("lodash");

module.exports = {
    name: "random",
    aliases: ["randomselect", "randomselection"],
    description: "Randomly selects an option from list of arguments",
    execute(message, args) {
        return message.reply(_.sample(args));
    },
};
