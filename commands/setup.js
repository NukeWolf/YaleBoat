const stateAbbreviations = require('../src/stateAbbreviations')

module.exports = {
    name: 'setup',
    aliases:[],
    description: 'Does a variety of setup functions for other commands/features.',
    permissions: ['ADMINISTRATOR'], 
    /**
     * @param  {import('discord.js').Message} message
     * @param  {Array<String>} args
     */
    async execute(message,args) {
        const action = args[0]
        switch(action){
            case "createStateRoles":
                setupStateRoles(message)
                break
            case "setupStates":
                setupStateEmojis(message);
                break
            case "deleteStateRoles":
                deleteStateRoles(message)
                break
        }
    }
}
/**
 * @param  {import('discord.js').Message} message
 */
const setupStateRoles = async (message) => {
    const guild = await message.client.getMainGuild()
    Object.entries(stateAbbreviations).forEach( state => {
        guild.roles.create({
            data:{
                name:state[1],
                mentionable:true
            },
        })
    })
    message.client.log("info","Added State Roles",true)
}

const deleteStateRoles = async (message) => {
    const guild = await message.client.getMainGuild()
    Object.values(stateAbbreviations).forEach( state => {
        const role = guild.roles.cache.find(role => state === role.name)
        if(role) role.delete()
        .catch(e =>{
            console.log(`Role ${state} didn't exist` )
        })

    })
    message.client.log("info","Deleted State Roles",true)
}
/**
 * @param  {import('discord.js').Message} message
 */
const setupStateEmojis = async (message) => {
    const msg = await message.channel.send("**Role Menu: US State**\nPlease react with your corresponding 2 letter state abbreviation.  Any order of letters should work and you'll get a confirmation from YaleBoat.\nPress the :x: key to clear your state roles.")
    const msg2 = await message.channel.send('_ _')
    await msg.react('❌')
    let counter = 1
    for (var i = 65; i <= 90; i++) {
        const num = i+101
        if(counter < 20){
            await msg.react(`%F0%9F%87%${num.toString(16)}`)
            counter++;
        }
        else{
            await msg2.react(`%F0%9F%87%${num.toString(16)}`)
        }
        
     }
}