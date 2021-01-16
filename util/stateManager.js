const stateAbbreviations = require('../src/stateAbbreviations')
const {stateMsg1,stateMsg2,roleChannel} = require('../config')
//TODO Make this dynamic and don't be lazy.
const messageId  = stateMsg1
const messageId2 = stateMsg2
const channelId = roleChannel
const offset = 101

module.exports = class StateManager{
    
    /**
     * Creates the 
     * @param  {import('discord.js').Guild} guild
     */
    constructor(client){
        client.getMainGuild()
            .then(guild => {
                this.guild = guild
                return guild.channels.resolve(channelId).messages.fetch(messageId)
            })
            .then(msg => {
                this.msg = msg
                this.reactionCollector = msg.createReactionCollector((reaction,user)=>{
                    return !user.bot
                })

                this.reactionCollector.on('collect',(reaction,user) => { 
                    //TODO Check if the letter is actually a letter
                    const letter = this.processEmoji(reaction.emoji.identifier)
                    if(letter === "clear") this.clearStateRoles(user);
                    else if(letter) this.processLetter(letter,user);
                    reaction.users.remove(user);
                })
            })
        // TODO I'm lazy im sorry, theres gotta be a better way to handle 2 messages but idc
        client.getMainGuild()
            .then(guild => {
                this.guild = guild
                return guild.channels.resolve(channelId).messages.fetch(messageId2)
            })
            .then(msg => {
                this.msg2 = msg
                this.reactionCollector = msg.createReactionCollector((reaction,user)=>{
                    return !user.bot
                })

                this.reactionCollector.on('collect',(reaction,user) => { 
                    //TODO Check if the letter is actually a letter
                    const letter = this.processEmoji(reaction.emoji.identifier)
                    if(letter === "clear") this.clearStateRoles(user);
                    else if(letter) this.processLetter(letter,user);
                    reaction.users.remove(user);
                })
            })
    }
    /**
     * When given an emoji identifier code, it will return a char from A-Z according to the emoji given.
    * @param  {String} emojiIdentifier
    * @returns {String}
    */
    processEmoji = (emojiIdentifier) =>{
        //Start of all Letter emojis in discord
        if (emojiIdentifier.startsWith('%F0%9F%87%')){
            const lastHex = emojiIdentifier.slice(-2)
            const charCode = Number("0x"+lastHex)-offset
            return (charCode>=65 ** charCode <=90) ? String.fromCharCode(charCode) : undefined
        }
        // :x: Identifer
        else if(emojiIdentifier === "%E2%9D%8C") return "clear"; 
    }
    /**
     * Based on the users current "state" (get it? pun), it'll handle adding the state or storing the data.
     * @param  {String} char
     * @param  {import('discord.js').User} user
     */
    processLetter(char,user){
        if (!user.state) user.state = '';
        user.state+=char
        //If nothing in the cache
        if(user.state.length == 1){
            user.timeout = setTimeout((user) =>{
                delete user.state
            },15000,user)
        }
        else{
            let state = user.state
            if (state in stateAbbreviations ||  state[1]+state[0] in stateAbbreviations ){
                this.clearStateRoles(user)
                const stateName = stateAbbreviations[state] || stateAbbreviations[state[1]+state[0]]
                const role = this.guild.roles.cache.find(role => role.name === stateName)
                this.guild.members.fetch(user)
                    .then((member) => {
                        member.roles.add(role)
                        user.send("**States:** You have been added to "+ role.name )
                    })
                    .catch( e =>{
                        client.log("error",`${user} can't add role ${state}.`,true)
                        user.send("Error occurred while attempting to add your role.")
                    })
            }
            else{
                user.send("**States:** Invalid State Abbreviation sent. You sent in: "+ state)
            }
            delete user.state
            clearTimeout(user.timeout)
        }
    }
    async clearStateRoles(user) {
        const states = Object.values(stateAbbreviations)
        const member = await this.guild.members.fetch(user)
        member.roles.cache.forEach(role =>{
            if(states.includes(role.name)){
                member.roles.remove(role)
                user.send(`**States:** ${role.name} has been removed.`)
            }
        })
    }
        
}
