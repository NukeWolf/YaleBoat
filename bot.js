require("dotenv").config();
const fs = require("fs");
const Discord = require("discord.js");
require("discord-reply");
const { prefix, roleId, mainGuild } = require("./config");
const inviteManager = require("./services/inviteManager");
const stateManager = require("./services/stateManager");
const bulldogDaysManager = require("./services/bulldog");

const client = new Discord.Client();
client.commands = new Discord.Collection();
client.log = require("./util/log");
const initChess = require("./util/initChess");
const setupCron = require("./services/cron");

/**
 * Gets the main Yale 2025 Guild
 * @returns {Discord.Guild}
 */
function getMainGuild() {
    return client.guilds.fetch(mainGuild).catch((e) => {
        client.log("error", e);
        return message.reply("Error occurred attempting to set role.");
    });
}
client.getMainGuild = getMainGuild;

//Command Setup
const commandFiles = fs
    .readdirSync("./commands")
    .filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}
const commandFolders = fs
    .readdirSync("./commands")
    .filter((file) => !file.endsWith(".js"))
    .forEach((folder) => {
        fs.readdirSync(`./commands/${folder}`).forEach((file) => {
            const command = require(`./commands/${folder}/${file}`);
            client.commands.set(command.name, command);
        });
    });

//DB Setup
client.db = require("./util/db").init();

/**
 * @param {Discord.Guild} guild
 */
client.once("ready", async () => {
    client.db.sync();
    client.user.setPresence({ activity: { name: "Try !chess; !course" } });
    client.log("info", "Bot is now Online!");
    client.inviteManager = new inviteManager(client);
    client.stateManager = new stateManager(client);
    // client.bulldog = new bulldogDaysManager(client);

    initChess(client);
    setupCron(client);
});

client.on("inviteCreate", (invite) => {
    client.inviteManager.onInviteCreate(invite);
});

client.on("guildMemberAdd", async (member) => {
    //Check Invite and update accordingly
    client.inviteManager.onUserJoin(member);

    const welcomeEmbed = new Discord.MessageEmbed()
        .attachFiles(["./src/bulldog.jpg"])
        .setColor("#0a47b8")
        .setTitle("Welcome to the Yale 2025 discord server!")
        .setDescription(
            "In order to verify yale student status, we will need to verify your email. Start the verification proccess by typing `!verify <yale.edu email>`"
        )
        .addField("Example", "`!verify handsome.dan@yale.edu`")
        .addField(
            "**You will recieve an email afterwords with a 6 digit code. Verify using that code**",
            "Ex. !verify 123456"
        )
        .addField(
            "**Contact and Help**",
            "If you need help with any of this, or can't access your portal, DM any of the admins/moderators on the server for verification help / admited role."
        )
        .setImage("attachment://bulldog.jpg")
        .setTimestamp();

    /*   const welcomeEmbed = new Discord.MessageEmbed()
        .attachFiles(["./src/bulldog.jpg"])
        .setColor("#0a47b8")
        .setTitle("Welcome to the Yale 2025 discord server!")
        .setDescription(
            "**__Welcome to the Yale Class of 2025!__**\nThis is Yaleboat, a bot for handling verification and other random cool commands.\nPlease make sure to read rules and set your roles in #roles."
        )
        .addField("Random Commands", "!course, !chess, !randomcollege")
        .addField(
            "Contact and Help",
            "If you need help with the server, DM any of the admins on the server for help."
        )
        .setImage("attachment://bulldog.jpg")
        .setTimestamp(); */

    //Apropriate Welcome message based on verification database.
    const user = await client.db.Users.findOne({
        where: { user_id: member.id },
    });
    if (user) {
        if (user.get("malicious")) {
            member.send(
                "Welcome to the Yale 2025 Discord Server!\nIn order to verify your account, please DM one of the admins for assistance."
            );
        } else if (user.get("verified")) {
            member.roles.add(roleId);
            member.send(
                "Welcome back to the Yale 2025 Discord Server! Please reassign your roles."
            );
        } else {
            member.send(welcomeEmbed).catch((e) => {
                client.log(
                    "error",
                    "Couldn't send welcome verification/message to " +
                        member.toString() +
                        ".",
                    true
                );
            });
        }
    } else {
        member.send(welcomeEmbed).catch((e) => {
            client.log(
                "error",
                "Couldn't send welcome verification/message to " +
                    member.toString() +
                    ".",
                true
            );
        });
    }
});
const angadText = ["🇦", "🇳", "🇬", "🅰️", "🇩", "⤴️"];
const kelechiText = ["🇰", "🇱", "🇪", "🇨", "🇭", "🇮", "⤴️"];

const reactAngad = async (message, reactArr) => {
    for (let i = 0; i < reactArr.length; i++) {
        await message.react(reactArr[i]);
    }
};

client.on("message", async (message) => {
    if (
        message.content.toLowerCase().includes("yale") &&
        message.channel.type !== "dm"
    )
        message.react("797522900965392395");
    if (message.content.toLowerCase().includes("harvard")) message.react("😞");
    // if (message.member?.id == "830234142062280744")
    //     reactAngad(message, angadText);
    /*if (message.member.id == "754425089931608115")
        reactAngad(message, kelechiText);*/

    if (message.author.bot) return;

    if (message.channel.name === "general") {
        const morse = /^[+.|\s\-…\/\–\—\−]+$/;
        if (!morse.test(message.content)) {
            await message.lineReply("-- --- .-. ... . / --- -. .-.. -.--");
            return setTimeout(() => {
                message.delete();
            }, 2000);
        }
    }
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    //Finds Commands and exits early if no alias is found.
    const cmd =
        client.commands.get(commandName) ||
        client.commands.find((cmd) => cmd.aliases.includes(commandName));
    if (!cmd) return;

    //Checks for DM Only
    if (cmd.dmOnly && message.channel.type !== "dm") return;
    //Checks for Guild Only
    if (cmd.guildOnly && message.channel.type == "dm") return;

    //Malicious Check
    const user = await client.db.Users.findOne({
        where: { user_id: message.author.id },
    });
    if (user && user.get("malicious"))
        return message.reply(
            "There was an issue verifying your ID. Please contact an Admin for further assistance."
        );

    //Permission Check
    if (cmd.permissions) {
        if (
            !message.member ||
            !message.member.permissionsIn(message.channel).has(cmd.permissions)
        )
            return;
    }

    try {
        cmd.execute(message, args);
    } catch (err) {
        client.log("error", err);
        message.reply(
            "There as an error executing your comamnd. Please contact an Admin."
        );
    }
});

client.login(process.env.BOT_TOKEN);
