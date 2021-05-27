module.exports = {
    name: "ycopy",
    aliases: [],
    description: "Copys messages from one channel to another",
    permissions: ["MANAGE_MESSAGES"],
    /**
     * @param  {import('discord.js').Message} message
     * @param  {Array<String>} args
     */
    async execute(message, args) {
        if (!args.length)
            return message.channel.send("Usage: `!ycopy <Targeting Channel>`");
        const mentioned = message.mentions.channels.first();

        const messages = await mentioned.messages.fetch({ limit: 100 });
        //Filter through messages with the same author. Also deletes Rhythm Bots ID
        const reversed = messages.array().reverse();
        console.log(reversed);
        for (const copied of reversed) {
            if (copied.embeds) {
                await message.channel.send(copied.content, {
                    embed: copied.embeds[0],
                });
            } else {
                await message.channel.send(copied.content);
            }
        }
    },
};
