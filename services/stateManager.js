const stateAbbreviations = require("../src/stateAbbreviations");
const offset = 101;

module.exports = class StateManager {
    /**
     * Creates the
     * @param  {import('discord.js').Guild} guild
     */
    constructor(config) {
        this.guild = config.guild;
        this.reactionCollector = [];
        this.init(config);
    }

    init = async (config) => {
        const channel = await this.guild.channels.cache.find(
            (channel) => channel.id == config.roleChannel
        );
        // I'm not lazy anymore lets goooo
        config.messages.forEach(async (messageID) => {
            const message = await channel.messages.fetch(messageID);
            const collector = message.createReactionCollector(
                (reaction, user) => {
                    return !user.bot;
                }
            );
            collector.on("collect", (reaction, user) => {
                //TODO Check if the letter is actually a letter
                const letter = this.processEmoji(reaction.emoji.identifier);
                if (letter === "clear") this.clearStateRoles(user);
                else if (letter) this.processLetter(letter, user);
                reaction.users.remove(user);
            });
            this.reactionCollector.push(collector);
        });
    };
    /**
     * When given an emoji identifier code, it will return a char from A-Z according to the emoji given.
     * @param  {String} emojiIdentifier
     * @returns {String}
     */
    processEmoji = (emojiIdentifier) => {
        //Start of all Letter emojis in discord
        if (emojiIdentifier.startsWith("%F0%9F%87%")) {
            const lastHex = emojiIdentifier.slice(-2);
            const charCode = Number("0x" + lastHex) - offset;
            return charCode >= 65 ** charCode <= 90
                ? String.fromCharCode(charCode)
                : undefined;
        }
        // :x: Identifer
        else if (emojiIdentifier === "%E2%9D%8C") return "clear";
    };
    /**
     * Based on the users current "state" (get it? pun), it'll handle adding the state or storing the data.
     * @param  {String} char
     * @param  {import('discord.js').User} user
     */
    processLetter(char, user) {
        if (!user.state) user.state = "";
        user.state += char;
        //If nothing in the cache
        if (user.state.length == 1) {
            user.timeout = setTimeout(
                (user) => {
                    delete user.state;
                },
                15000,
                user
            );
        } else {
            let state = user.state;
            if (
                state in stateAbbreviations ||
                state[1] + state[0] in stateAbbreviations
            ) {
                this.clearStateRoles(user);
                const stateName =
                    stateAbbreviations[state] ||
                    stateAbbreviations[state[1] + state[0]];
                const role = this.guild.roles.cache.find(
                    (role) => role.name === stateName
                );
                this.guild.members
                    .fetch(user)
                    .then((member) => {
                        member.roles.add(role);
                        user.send(
                            "**States:** You have been added to " + role.name
                        );
                    })
                    .catch((e) => {
                        this.guild.client.log(
                            "error",
                            `${user} can't add role ${state}.`,
                            this.guild
                        );
                        user.send(
                            "Error occurred while attempting to add your role."
                        );
                    });
            } else {
                user.send(
                    "**States:** Invalid State Abbreviation sent. You sent in: " +
                        state
                );
            }
            delete user.state;
            clearTimeout(user.timeout);
        }
    }
    async clearStateRoles(user) {
        const states = Object.values(stateAbbreviations);
        const member = await this.guild.members.fetch(user);
        member.roles.cache.forEach((role) => {
            if (states.includes(role.name)) {
                member.roles.remove(role);
                user.send(`**States:** ${role.name} has been removed.`);
            }
        });
    }
};
