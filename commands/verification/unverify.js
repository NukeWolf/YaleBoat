/**
 * @typedef {import('discord.js').Client} client
 * @typedef {import('discord.js').Message} message
 */

module.exports = {
    name: "unverify",
    aliases: [],
    description: "Unverify a user and unlinks their account to the ID",
    dmOnly: true,
    ignore: true,
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
                "You aren't verified yet. Please do !verify <email> to start the verification process."
            );

        client.guilds.cache.forEach((guild) => {
            const member = guild.member(message.author);
            if (member) {
                if (!guild.available) {
                    return message.reply(
                        `${guild.name} not available, please contact an admin.`
                    );
                }
                if (!guild.config.admittedRole) return;
                //Remove Role
                member.roles.remove(guild.config.admittedRole);
                client.log(
                    "verification",
                    `<@${message.author.id}> has been unverified.`,
                    guild
                );
            }
        });

        return message.reply(
            "Successfully Unverified! You can now register another discord account with this email, or do !verify to regain access to server."
        );
    },
};
