module.exports = {
    name: "netid",
    aliases: ["net"],
    description: "netid info",
    /**
     * @param  {import 'discord.js'.Message} message
     * @param  {} args
     */
    execute(message, args) {
        return message.channel.send(
            "```For everyone who was asking about netIDs and emails: it takes a while after you commit to activate your netID, but you can activate it through this link: https://veritas.its.yale.edu/netid/ActivatePreLogin_Prepare.do or through the matriculation letter that is located on the Yale first year page (it's linked in the email that you get sent after you commit). If it doesn't work, then you might need to wait a little longer; as for emails, you might need to wait even longer for that to activate, but you can sign into it on mail.bulldogs.yale.edu after you activate your netID. After you get your email, you can get perks like free HBO and adobe cloud.```"
        );
    },
};
