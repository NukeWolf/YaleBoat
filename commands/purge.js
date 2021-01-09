module.exports = {
    name: 'purge',
    aliases:['clear'],
    description: 'Mass deletes a number of most recent messages. Can also select a person to only delete.',
    permissions: ['MANAGE_MESSAGES'], 
    /**
     * @param  {import('discord.js').Message} message
     * @param  {Array<String>} args
     */
    execute(message,args) {
        if(!args.length || isNaN(args[0])) return message.channel.send('Usage: `!purge <number> <@mention> (optional)`');
        const mentioned = message.mentions.users.first()

        if(mentioned){
            message.channel.messages.fetch({limit:100})
                .then(msgs => {
                    //Filter through messages with the same author
                    let deletedMessages = msgs.filter(msg => {
                        return msg.author.id === mentioned.id
                    }).array();
                    if(deletedMessages.length > args[0]) {deletedMessages = deletedMessages.splice(0,args[0])};
                    message.channel.bulkDelete(deletedMessages)
                });
        }
        else{
            message.channel.bulkDelete(Number(args[0])+1)
        }
    }
}
