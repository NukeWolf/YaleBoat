const _ = require("lodash");

module.exports = {
    name: "dice",
    aliases: ["roll", "diceroll"],
    description: "Rolls a dice",
    execute(message, args) {
        return message.reply(_.sample(["1", "2", "3", "4", "5", "6"]));
    },
};
