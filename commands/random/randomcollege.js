const _ = require("lodash");

const Discord = require("discord.js");
const COLLEGES = [
    "Benjamin Franklin",
    "Berkeley",
    "Branford",
    "Davenport",
    "Ezra Stiles",
    "Grace Hopper",
    "Jonathan Edwards",
    "Morse",
    "Pauli Murray",
    "Pierson",
    "Saybrook",
    "Silliman",
    "Timothy Dwight",
    "Trumbull",
];

module.exports = {
    name: "randomcollege",
    aliases: ["residentialcollege,residential"],
    description: "Chooses a random residential college",
    execute(message, args) {
        return message.reply(_.sample(COLLEGES));
    },
};
