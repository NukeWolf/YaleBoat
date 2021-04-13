const _ = require("lodash");

module.exports = {
    name: "coinflip",
    aliases: ["coin", "flip"],
    description: "Flips a coin.",
    execute(message, args) {
        return message.reply(_.sample(["Heads", "Tails"]));
    },
};
