module.exports = {
    name: 'chess',
    aliases:[],
    description: 'Challenge someone to play chess.',
    permissions: [], 
    guildOnly: true,
    /**
     * @param  {import('discord.js').Message} message
     * @param  {Array<String>} args
     */
    async execute(message,args) {
        const action = args[0]
        switch(action){
            case "challenge":
                const mentioned = message.mentions.users.first()
                break
            default:
                message.reply(helpEmbed)
        }
    }
}

const helpEmbed = {
    title:"**Chess Commands**",
    description:"Challenge someone to play chess",
    'color':0x0a47b8,
    fields:[
        {
            name: '__**!chess challenge**__',
            value: 'Usage: `!chess challenge <mention>`\nThis command allows you to challenge someone to game of chess'
        },
        
    ],
    footer:{
        text:`This Feature uses chess.js and chessboard.js`,
    }
}