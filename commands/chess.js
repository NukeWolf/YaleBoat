const ChessGame = require('../services/ChessGame') 
const { chessCategory } = require('../config')
const challengeExpiration = 30

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
        const guild = message.guild
        const unix = Math.floor(Date.now() / 1000)
        const setupGame = async (mentioned,challenge) =>{
            const challengerMember = guild.member(message.author)
            const opponentMember = guild.member(mentioned)
            const role = await guild.roles.create({data:{name:`chess${unix}`}})

            challengerMember.roles.add(role)
            opponentMember.roles.add(role)

            const name = `${challengerMember.nickname || challengerMember.user.username} vs ${opponentMember.nickname || opponentMember.user.username} ${unix}`
            const channel = await guild.channels.create(name,
                {
                    parent:chessCategory,
                    permissionOverwrites:[
                        {
                            id:role.id,
                            allow:['VIEW_CHANNEL']
                        },
                        {
                            id:guild.roles.everyone.id,
                            deny:['VIEW_CHANNEL']
                        }
                    ]
                }
            )

            message.author.chess = new ChessGame(channel,message.author.id,mentioned.id)
            mentioned.chess = message.author.chess
            const cleanup = () =>{
                message.author.chess = undefined
                mentioned.chess = undefined
                role.delete()
                channel.delete()
            }
            message.author.chess.setCleanup(cleanup)

            //Spectating
            await challenge.react('🎥')
            const reactionCollector = challenge.createReactionCollector((reaction,user)=>{
                return reaction.emoji.name == "🎥"
            })
            reactionCollector.on('collect',async (reaction,user) => { 
                guild.member(user).roles.add(role)
            })
            return channel
        }
        const action = args[0]
        switch(action){
            case "challenge":
                const mentioned = message.mentions.users.first()
                if(!mentioned) return message.reply("You must mention someone to challenge.");
                //Create the challenge Embed
                const challengerMember = guild.member(message.author)
                const opponentMember = guild.member(mentioned)
                const challenge = await message.channel.send(challengeEmbed(challengerMember,opponentMember))

                //Create the reaction collector for the user to accept the challenge
                const reactionCollector = challenge.createReactionCollector((reaction,user)=>{
                    return emojis.includes(reaction.emoji.name) && user.id == mentioned.id;
                },{max:1,time:30*60*1000})
                //Where the channel gets created if needed
                reactionCollector.on('collect',async (reaction,user) => { 
                    //Tests if it is a checkmark
                    if(reaction.emoji.name == emojis[1]){
                        const channel = await setupGame(mentioned,challenge)
                        challenge.edit(challengeEmbed(challengerMember,opponentMember,true,channel))
                    }
                    else{
                        challenge.edit(challengeEmbed(challengerMember,opponentMember,false))
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
 * @param  {import('discord.js').TextChannel} channel
 */
const challengeEmbed = (challenger,opponent,accepted,channel) => {
    if (accepted == null) description = `Does ${opponent.toString()} accept the challenge?`;
    if (accepted === false) description = `${opponent.toString()} declined the challenge.`
    if (accepted === true) description = `${opponent.toString()} accepted the challenge.\nCheck channel ${channel.toString()}\nPress :movie_camera: to get permissions to channel and spectate the match.`
    return {embed:{
        "title":`${challenger.nickname || challenger.user.username} challenges ${opponent.nickname || opponent.user.username} to a chess match!`,
        description,
        footer: {
            text:(accepted == null) ? "This challenge expires in 30 minutes" : "" ,
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