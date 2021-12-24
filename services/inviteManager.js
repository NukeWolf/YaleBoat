const Discord = require("discord.js");

function formatTime(unix, delim = "\n") {
    var date = new Date(
        new Date(unix).toLocaleString("en-US", { timeZone: "America/New_York" })
    );
    var months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];
    // Hours part from the timestamp
    var hours = date.getHours();
    var PM = hours < 12 ? "AM" : "PM";
    // Minutes part from the timestamp
    var minutes = "0" + date.getMinutes();
    var month = months[date.getMonth()];
    var day = date.getDate();

    return (
        month +
        " " +
        day +
        delim +
        (hours % 12 || 12) +
        ":" +
        minutes.substr(-2) +
        PM
    );
}
/**
 * @param  {import('discord.js').Invite} invite
 */
const createInviteEmbed = (invite) => {
    const expireDate =
        invite.maxAge != 0
            ? formatTime(invite.createdTimestamp + invite.maxAge * 1000)
            : "Never";
    const createDate = formatTime(invite.createdTimestamp, ", ");
    const maxUses = invite.maxUses || "No Limit";
    const inviter = invite.inviter;
    return new Discord.MessageEmbed()
        .setAuthor(inviter.username, inviter.avatarURL())
        .setColor("#0a47b8")
        .setDescription("Created by: " + inviter.toString())
        .setTitle(`Invite created with id ${invite.code}`)
        .addFields(
            {
                name: "Uses / Max Uses",
                value: invite.uses + " / " + maxUses,
                inline: true,
            },
            { name: "Expires on", value: expireDate, inline: true },
            { name: "Channel", value: invite.channel.toString(), inline: true }
        )
        .addField("Users joined through this invite:", "None")
        .setFooter("EST | Created • " + createDate);
};

module.exports = class inviteManager {
    //Gets reference list
    constructor({ guild, channel }) {
        this.guild = guild;
        this.channel = channel;
        guild.fetchInvites().then((list) => (this.inviteList = list));
    }
    /**
     * Adds the member to the invite log when joined and tracks which invite link they used, by comparing a old cached list of invites with a new invite list.
     * @param  {import('discord.js').GuildMember} member
     */
    onUserJoin = async (member) => {
        const newInviteList = await member.guild.fetchInvites();
        const updatedInvite = newInviteList.find((invite) => {
            if (this.inviteList.has(invite.code)) {
                const oldInvite = this.inviteList.get(invite.code);
                return invite.uses > oldInvite.uses;
            }
            return false;
        });
        if (updatedInvite) {
            const message = await this.fetchMessage(updatedInvite);
            if (!message)
                return this.client.log(
                    "error",
                    `${member.toString()} joined with ${updatedInvite.code}`,
                    true
                );
            const oldEmbed = message.embeds[0];
            //Update Uses
            const useField = oldEmbed.fields[0].value;
            oldEmbed.fields[0].value =
                updatedInvite.uses +
                useField.substring(useField.indexOf("/") - 1);
            //Append the new user to the field
            if (oldEmbed.fields[3].value === "None")
                oldEmbed.fields[3].value = "";
            let fieldsSize = oldEmbed.fields.length;
            if (
                (
                    oldEmbed.fields[fieldsSize - 1].value +
                    member.toString() +
                    " • "
                ).length >= 1023
            ) {
                oldEmbed.fields.push({ name: "More Users", value: "• " });
                fieldsSize += 1;
            }
            oldEmbed.fields[fieldsSize - 1].value += member.toString() + " • ";
            //Edit new embed
            await message.edit(oldEmbed);
        }
        //Update inviteList
        this.inviteList = newInviteList;
    };
    onInviteCreate = async (invite) => {
        const guild = invite.guild;
        await this.channel.send(createInviteEmbed(invite));
        this.inviteList = await guild.fetchInvites();
    };
    /**
     * @param  {import('discord.js').Client} client
     */
    fetchMessage = async (invite) => {
        const guild = invite.guild;
        const messages = await this.channel.messages.fetch({ limit: 100 });
        const inviteCode = invite.code;
        const message = messages.find((message) => {
            if (message.embeds.length == 0) return false;
            const title = message.embeds[0].title;
            return title.includes(inviteCode);
        });
        return message;
    };
};
