const { Chess } = require('chess.js')
const ChessImageGenerator = require('chess-image-generator')
const {MessageAttachment} = require('discord.js')
const Jimp = require('jimp')

class ChessGame{
    /**
     * @param  {import('discord.js').TextChannel} channel
     * @param  {} white
     * @param  {} black
     */
    constructor(channel,white,black){
        this.game = new Chess()
        this.channel = channel
        this.white = white
        this.black = black
        //True is white, False is black
        this.turn = white
        this.imgGen = new ChessImageGenerator()
        this.collector = channel.createMessageCollector((m) => {
            return m.author.id == white || m.author.id == black
        });
        this.collector.on('collect', (message) =>{
            this.parseCommand(message)
        })
        this.render()
    }
    parseCommand(message){
        if(message.content.startsWith('!exit')){
            
        }
        const movealiases = ['!m','!move','m','move']
        if(movealiases.some((command) => message.content.startsWith(command+" "))){
            if(message.author.id != this.turn) return message.reply("Not your turn.");
            const args = message.content.split(' ')
            const result = this.game.move(args[1],{sloppy:true})
            if(!result){
                return message.reply("Move Invalid.")
            }
            this.turn = (this.turn == this.white) ? this.black : this.white
            this.render()
        }
    }
    async render(){
        //console.log(this.game.ascii())
        this.imgGen.loadFEN(this.game.fen())
        const buffer = await this.imgGen.generateBuffer()
        const image = await Jimp.read(buffer)
        image.composite(await Jimp.read('./src/template.png'),0,0)
        const attatchment = new MessageAttachment(await image.getBufferAsync(Jimp.MIME_PNG),'game.png')
        this.channel.send(attatchment)
    }
    endGameCheck(){

    }

    cleanup(){
        
    }
    
}

const commands = [
    {
        name:"move",
        aliases:"",
        description:"Move a piece"
    }
]

module.exports = ChessGame