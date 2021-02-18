const {mainGuild,chessCategory} = require('../config')
const ChessGame = require('../services/ChessGame')

/**
 * @param  {import('discord.js').Client} client
 */
module.exports = (client) =>{
    const guild = client.guilds.resolve(mainGuild)
    const category = guild.channels.resolve(chessCategory)
    
    
    /**
     * @param  {import('discord.js').TextChannel} channel
     */
    const setup = async (channel) =>{
        const unix = channel.name.match(/[\d]+$/g)
        const rawConfig = await channel.messages.fetch(channel.topic)
        if(!rawConfig.content) return;
        const config = rawConfig.content.split('|')
        const player1 = guild.member(config[0])
        const player2 = guild.member(config[1])
        const turn = config[2]
        const pgn = config[3]
        const chess = new ChessGame(channel,player1.id,player2.id,{turn,pgn,config:rawConfig})
        player1.chess = chess
        player2.chess = chess
        const cleanup = () =>{
            player1.chess = undefined
            player2.chess = undefined
            const role = guild.roles.cache.find((role) =>{
                return role.name == `chess${unix}`
            })
            role.delete()
            channel.delete()
        } 
        chess.setCleanup(cleanup)
        
    }
    category.children.forEach(setup)
}