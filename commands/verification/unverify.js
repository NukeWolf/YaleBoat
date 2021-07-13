/**
 * @typedef {import('discord.js').Client} client
 * @typedef {import('discord.js').Message} message
 */

const { roleId } = require("../../config");
module.exports = {
    name: "unverify",
    aliases: [],
    description: "Unverifys a user and unlinks their account to the ID",
    dmOnly: true,
    /**
     * Execute Function
     * @param  {client} client
     * @param  {message} message
     * @param  {Array.<String>} args
     */
    async execute(message, args) {
        const client = message.client;
        const Users = message.client.db.Users;
        const rowCount = await Users.destroy({
            where: { user_id: message.author.id },
        });
        if (!rowCount)
            return message.reply(
                "You aren't verified yet. Please do !verify <email> to start the verification proccess."
            );

        const guild = await client.getMainGuild();
        if (!guild.available)
            return message.reply(
                "Server not available, please contact an admin."
            );
        const guildMember = guild.member(message.author);
        guildMember.roles.remove(roleId);

        client.log(
            "verification",
            `<@${message.author.id}> has been unverified.`,
            true
        );
        return message.reply(
            "Succesfully Unverified! You can now register another discord acount with this email, or do !verify to regain access to server."
        );
    },
};
