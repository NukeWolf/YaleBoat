const { Chess } = require('chess.js')
const ChessImageGenerator = require('chess-image-generator')
const {MessageAttachment} = require('discord.js')
const Jimp = require('jimp')

class ChessGame{
    /**
     * @param  {import('discord.js').TextChannel} channel
     * @param  {import('discord.js').Snowflake} player1
     * @param  {import('discord.js').Snowflake} player2
     */
    constructor(channel,player1,player2,config){
        this.player1 = player1
        this.player2 = player2
        this.channel = channel
        channel.send(`${channel.guild.member(player2).toString()}, Type 'black', 'white', or 'random' for side selection.`)
        const setupCollector = channel.createMessageCollector((m) => {
            const options = ['black','white','random']
            return m.author.id == player2 && options.includes(m.content.toLowerCase())
        },{max:1});
        setupCollector.on('collect', (message) =>{
            switch(message.content.toLowerCase()){
                case "white":
                    this.turn = player2
                    break
                case "random":
                    this.turn = (Math.random() < 0.5) ? player1 : player2
                    break
                default:
                    this.turn = player1
            }
            this.init()
        })
    }
    async init(){
        this.config = await this.channel.send("Ignore this, used to track game")
        this.channel.setTopic(this.config.id)

        this.game = new Chess()
        this.imgGen = new ChessImageGenerator()
        this.collector = this.channel.createMessageCollector((m) => {
            return m.author.id == this.player1 || m.author.id == this.player2
        });
        this.collector.on('collect', (message) =>{
            this.parseCommand(message)
        })
        await this.channel.send({embed:helpEmbed})
        this.render()
    }
    parseCommand(message){
        if(message.content.startsWith('help')){
            message.reply({embed:helpEmbed})
        }
        const movealiases = ['!m','!move','m','move']
        if(movealiases.some((command) => message.content.toLowerCase().startsWith(command+" "))){
            //Check if its their turn
            if(message.author.id != this.turn) return message.reply("Not your turn.");
            //Checks if K
            const args = message.content.split(' ')
            if(args[1][0] == "K") return message.reply("Use `N` for knight instead of K.")

            const result = this.game.move(args[1],{sloppy:true})
            if(!result){
                return message.reply("Move Invalid.")
            }
            this.turn = (this.turn == this.player1) ? this.player2 : this.player1
            this.render()
            const end = this.endGameCheck()
        }
    }
    async render(){
        //console.log(this.game.ascii())
        this.imgGen.loadFEN(this.game.fen())
        const buffer = await this.imgGen.generateBuffer()
        const image = await Jimp.read(buffer)
        image.composite(await Jimp.read('./src/template.png'),0,0)
        const attatchment = new MessageAttachment(await image.getBufferAsync(Jimp.MIME_PNG),'game.png')
        await this.channel.send(`${this.channel.guild.member(this.turn).toString()}, It's your turn to move!`,attatchment)
        const config = `${this.player1}|${this.player2}|${this.turn}|`+this.game.pgn()
        await this.config.edit(config)
    }
    endGameCheck(){
        const game = this.game
        if (game.in_checkmate()){
            return ""
        }
    }

    cleanup(){
        //Cleanup command
    }
    
}

const commands = [
    {
        name:"move",
        aliases:"",
        description:"Move a piece"
    }
]

const moveField = [
    '**Usage:** `!m <move>`',
    '**Aliases:** `m <move>`,`move <move>`,`!move <move>`',
    'In order to move you need to use Standard Algebraic Notation (SAN)',
]
const SAN = [
    'Some of the basics:',
    ' - **Moving Pawns:** `Ex. m e4` Pawn moves to e4. All you need to do is enter this destination of the pawn. ',
    ' - **Moving Other Pieces:** `Ex. m Qg4` Queen to g4. Type the __**capitlized**__ initial along with the destination of the piece. *Note - First intial of knight is `N`*',
    ' - **Precise Movement:** `Ex. m e2e4` Pawn to e4. Type the location of piece you want to move and destination. ',
    '*When you have conflicting moves `e.g. 2 rooks`. The method has the **least errors and mismoves.***'
]
const capturing = [
    'Capturing still uses the move command but you need to use an `x` to seperate intial location and end location.',
    '**Examples:** `m Bxb5` Bishop captures on b5.',
    '`m e4xd5` Pawn on e4 captures d5.',
    '`m exd5` Pawn in e column captures d5.'
]

const helpEmbed = {
    title:"**Chess Commands**",
    description:'Type help to resend this message.',
    'color':0x0a47b8,
    fields:[
        {
            name: '__**Moving**__',
            value: moveField.join('\n') + SAN.join('\n')
        },
        {
            name:'__**Capturing**__',
            value:capturing.join('\n')
        },
        {
            name:'__**Castling**__',
            value:"Castle Kingside with `m O-O`. Castle Queenside with `m O-O-O`. O's are capitalized."
        }
    ],
    footer:{
        text:`This Feature uses chess.js and chessboard.js`,
    }
}

const endGameEmbed = (winner,pgn) =>{
    const title = (!winner) ? "Stalemate or draw" : "Winner"
    const description = "PGN for analysis: " + pgn

    return {
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
}


module.exports = ChessGame