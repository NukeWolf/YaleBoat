const ChessGame = require('../services/ChessGame') 
//const { chessCategory } = require('../config')

const emojis = ['❌','✅']

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
                if(!mentioned) return message.reply("You must mention someone to challenge.");
                //Create the challenge Embed
                const challenge = await message.channel.send(challengeEmbed(message.guild.member(message.author),message.guild.member(mentioned)))

                //Create the reaction collector for the user to accept the challenge
                const reactionCollector = challenge.createReactionCollector((reaction,user)=>{
                    return emojis.includes(reaction.emoji.name) && user.id == mentioned.id;
                },{max:1})
                //Where the channel gets created if needed
                reactionCollector.on('collect',async (reaction,user) => { 
                    //Tests if it is a checkmark
                    if(reaction.emoji.name == emojis[1]){

                        const channel = await message.guild.channels.create()

                        message.author.chess = new ChessGame(channel,message.author.id,mentioned.id)
                        mentioned.chess = message.author.chess

                        challenge.edit(challengeEmbed(message.guild.member(message.author),message.guild.member(mentioned),true))
                    }
                    else{
                        challenge.edit(challengeEmbed(message.guild.member(message.author),message.guild.member(mentioned),false))
                    }
                })
                //Adding Reactions
                emojis.forEach((emoji)=>{
                    challenge.react(emoji)
                })
                
                break
            default:
                message.reply({embed:helpEmbed})
        }
    }
}

/**
 * @param  {import('discord.js').GuildMember} challenger
 * @param  {import('discord.js').GuildMember} opponent
 */
const challengeEmbed = (challenger,opponent,accepted) => {
    if (accepted == null) description = `Does ${opponent.toString()} accept the challenge?`;
    if (accepted === false) description = `${opponent.toString()} declined the challenge.`
    if (accepted === true) description = `${opponent.toString()} accepted the challenge. Spectate the match with the :`
    return {embed:{
        "title":`${challenger.nickname || challenger.user.username} challenges ${opponent.nickname || opponent.user.username} to a chess match!`,
        description,
        footer: {
            text:(accepted == null) ? "This challenge expires in 5 minutes" : "" ,
        },
        'color':0x0a47b8,
    }}
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