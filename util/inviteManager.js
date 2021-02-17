const { adminChannel } = require('../config')
const Discord = require('discord.js')

function formatTime(unix,delim = "\n"){
    var date = new Date(new Date(unix).toLocaleString("en-US", {timeZone: "America/New_York"}))
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    // Hours part from the timestamp
    var hours = date.getHours();
    var PM = (hours<12) ? "AM" : "PM"
    // Minutes part from the timestamp
    var minutes = "0" + date.getMinutes();
    var month = months[date.getMonth()];
    var day = date.getDate()
    
    return (month +" "+ day + delim + (hours%12 || 12) + ':' + minutes.substr(-2) + PM)
}
/**
 * @param  {import('discord.js').Invite} invite
 */
const createInviteEmbed = (invite) => { 
    const expireDate = (invite.maxAge != 0) ? formatTime(invite.createdTimestamp + invite.maxAge*1000) : "Never"
    const createDate = formatTime(invite.createdTimestamp,", ")
    const maxUses = invite.maxUses || "No Limit"
    const inviter = invite.inviter
    return new Discord.MessageEmbed()
        .setAuthor(inviter.username,inviter.avatarURL())
        .setColor('#0a47b8')
        .setDescription("Created by: " + inviter.toString())
        .setTitle(`Invite created with id ${invite.code}`)
        .addFields(
            { name: 'Uses / Max Uses', value: invite.uses + " / " + maxUses ,inline:true },
            { name: 'Expires on', value: expireDate , inline: true },
            { name: 'Channel', value: invite.channel.toString() , inline: true },
        )
        .addField("Users joined through this invite:","None")
        .setFooter('EST | Created • '+createDate);
}



module.exports = class inviteManager{
    constructor(client){
        (async() => {
            this.client = client
            //First time setup and check
            const configCheck = await client.db.Config.findAll()
            if(configCheck.length == 0) {
                await client.db.Config.create({id:1,invites:{}})
            };
            //Load the previous invite config
            this.inviteRefs = await this.fetchDBInviteRefs()
        })()  
        
        // Old Code that didn't update the source
        // client.getMainGuild()
        //     .then(guild =>{
        //         guild.fetchInvites().then( inviteList => {
        //             this.inviteList = inviteList
        //             const channel = guild.channels.resolve(adminChannel)
        //             inviteList.map( invite => {
                        
        //                 channel.send(createInviteEmbed(invite)).then(message => this.inviteRefs[invite.code] = message)
        //             })
        //         })
        //     })
        //     .catch(e => {
        //         client.log("error",e)
        //         client.log("info","InviteManager failed to load.",true)
        //     })
    }
    /**
     * Adds the member to the invite log when joined and tracks which invite link they used, by comparing a old cached list of invites with a new invite list.
    * @param  {import('discord.js').GuildMember} member
    */
    onUserJoin = async member =>{
        const newInviteList = await member.guild.fetchInvites()
        const updatedInvite = newInviteList.find(invite => {
            if(this.inviteList.has(invite.code)){
                const oldInvite = this.inviteList.get(invite.code)
                return invite.uses > oldInvite.uses
            }
            return false;
        })
        if(updatedInvite){
            const message = this.inviteRefs[updatedInvite.code]
            const oldEmbed = message.embeds[0];
            //Update Uses
            const useField = oldEmbed.fields[0].value
            oldEmbed.fields[0].value = updatedInvite.uses + useField.substring(useField.indexOf("/")-1)
            //Append the new user to the field
            if(oldEmbed.fields[3].value === 'None') oldEmbed.fields[3].value = '';
            oldEmbed.fields[3].value += member.toString() + " • "
            //Edit new embed
            message.edit(oldEmbed).then(message => this.inviteRefs[updatedInvite.code] = message)
        }
        //Update inviteList
        this.inviteList = newInviteList

    }
    onInviteCreate = async invite => {
        const guild = invite.guild
        const channel = guild.channels.resolve(adminChannel)
        const message = await channel.send(createInviteEmbed(invite))
        this.inviteRefs[invite.code] = message.id
        this.inviteList = await guild.fetchInvites()
    }
    fetchDBInviteRefs = async () => {
        try{
            const config = await this.client.db.Config.findOne({ where: { id: 1 } })
            const invites = await config.get('invites')
            return invites
        }
        catch(e){
            this.client.log('error',e,true)
        }
    }
}