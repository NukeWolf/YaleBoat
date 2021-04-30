const _ = require("lodash");

module.exports = {
    name: "coinflip",
    aliases: ["coin", "flip", "flipcoin"],
    description: "Flips a coin.",
    execute(message, args) {
        return message.reply(_.sample(["Heads", "Tails"]));
    },
};
