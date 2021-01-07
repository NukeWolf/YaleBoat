module.exports = {
    name: 'purge',
    description: 'Mass deletes a list of messages',
    permissions: ['MANAGE_MESSAGES'], 
    execute(message,args) {
        if(!args.length) return message.channel.send(`Usage: !purge <#OfMessages> (optional)<@mention>\nDeletes X number of the most recent messages. Can also mention a user to only`);
        
        

    }
}