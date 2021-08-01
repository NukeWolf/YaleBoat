/**
 * @typedef {import('discord.js').Client} client
 * @typedef {import('discord.js').Message} message
 */

const filter = require("../../util/filter");
const sendVerificationEmail =
    require("../../util/nodemail").sendVerificationEmail;

const { roleId } = require("../../config");

module.exports = {
    name: "verify",
    aliases: [],
    description: "Verifies a user along with an argument of a link",
    dmOnly: true,
    /**
     * Execute Function
     * @param  {client} client
     * @param  {message} message
     * @param  {Array.<String>} args
     */
    async execute(message, args) {
        const client = message.client;
        const Users = client.db.Users;

        //Get user from id. May not exist
        let user = await Users.findOne({
            where: { user_id: message.author.id },
        });
        if (user && user.get("verified") === true)
            return message.reply(
                "You are already verified. Please contact an admin if further assistance is needed."
            );
        if (!args.length)
            return message.channel.send(
                `You didn't pass through any email or code! To start the verification process, do !verify <yale.edu email>.`
            );

        const input = args[0].toLowerCase();
        const emailValidation = /^[a-zA-Z0-9.]+@yale.edu$/;
        const codeValidation = /^\d{6}$/;

        try {
            //Sending an email part
            if (emailValidation.test(input)) {
                //If user doesn't exist yet, create them
                if (!user) {
                    user = await Users.create({
                        user_id: message.author.id,
                    });
                }
                const code = Math.floor(100000 + Math.random() * 900000);
                user.set("email", input);
                user.set("authCode", code);
                await user.save();
                const loading = await message.reply(
                    "Sending email . . . (If this message doesn't go away within 15 seconds, please contact an admin.)"
                );
                try {
                    await sendVerificationEmail(input, code);
                    await loading.delete();
                    return message.reply(
                        "A code has been sent to your yale email for verification. Please check the email and verify with the 6 digit code by typing\n`!verify <6 digit code>`\n`Example: !verify 123456`"
                    );
                } catch (err) {
                    await loading.delete();
                    client.log(
                        "verification",
                        `<@${message.author.id}> could not receive at email \`${input}\`. Please contact them.`,
                        true,
                        client
                    );
                    client.log("error", err, true, client);
                    return message.reply(
                        "Email services are currently down or an invalid email was entered. Please contact one of the moderators for additional help / manual verification."
                    );
                }
            }
            //Validating the code and having the role
            if (codeValidation.test(input)) {
                if (!user)
                    return message.reply(
                        "No user account found. Please do !verify <yale.edu email> first to get a code."
                    );
                //Check to see if the user has both of these columns
                if (!(user.get("email") && user.get("authCode")))
                    return message.reply(
                        "Error in loading account details. Please do !verify <yale.edu email> again to get a new code."
                    );
                //If the code is correct then verify them and give role
                if (user.get("authCode") === input) {
                    const guild = await client.getMainGuild();
                    if (!guild.available) {
                        return message.reply(
                            "Server is not available, please try again later."
                        );
                    }

                    //Add Role
                    const guildMember = guild.member(message.author);
                    guildMember.roles.add(roleId);

                    user.set("verified", true);
                    user.set("authCode", 0);
                    await user.save();

                    client.log(
                        "verification",
                        `<@${message.author.id}> has been verified.`,
                        true,
                        client
                    );

                    return message.reply(
                        "**ID successfully activated!** You now have access to the server! Please make sure to read rules and set your roles in #roles.\nIf you ever switch discord accounts, use __!unverify__ to unlink your ID.\n**__Welcome to the Yale Class of 2025!__**"
                    );
                }
                //Invalid Code
                else {
                    return message.reply(
                        "Invalid code. Please verify the correct digits were inputted. You may receive a new code by typing !verify <email> again"
                    );
                }
            }

            //Invalid argument response
            return message.reply(
                "Invalid email or authentication code entered. Please try again."
            );
        } catch (e) {
            if (e.name === "SequelizeUniqueConstraintError") {
                return message.reply(
                    "This email has already been taken. Please contact an admin or moderator for extra assistance."
                );
            }
            client.log("error", e);
            return message.reply(
                "Error has Occurred. Please contact an Admin."
            );
        }
    },
};
