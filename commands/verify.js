/**
 * @typedef {import('discord.js').Client} client
 * @typedef {import('discord.js').Message} message
 */

const filter = require('../util/filter')
const { roleId } = require('../config');
module.exports = {
    name: 'verify',
    aliases:[],
    description: 'Verifys a user along with an argument of a link',
    dmOnly: true,
    /**
     * Execute Function
     * @param  {client} client
     * @param  {message} message
     * @param  {Array.<String>} args
     */
    async execute(message,args) {
        const client = message.client
        const Users = client.db.Users
        if(!args.length) return message.channel.send(`You didn't pass through any link!`);
        await new Promise(r => setTimeout(r, 2000));
        const link = args[0]

        const uuid = await filter(link,Users)
        try {
            if(!uuid.valid){
                if(uuid.malicious){
                    await Users.create({user_id:message.author.id,rawLink:link, malicious:true})
                    //Log the User
                    client.log('malicious',`**<@${message.author.id}> __is potentially malicious due to suspicious link entry. Request further verification.__\n - Link: ${link} \n - Reason: ${uuid.reason}**`,true)
                }
                return message.reply(uuid.error || "Error occurred.")
            }
            //If valid, Attempt to add them to DB
            const user = await Users.create({
                user_id:message.author.id,
                uuid: uuid.uuid,
                rawLink:link,
            })
            const guild = await client.getMainGuild()
            if(!guild.available){
                await Users.destroy({ where: { user_id: message.author.id } });
                return message.reply("Server is not available, please try again later.")
            };
            //Add Role
            const guildMember = guild.member(message.author)
            guildMember.roles.add(roleId)

            client.log("verification",`<@${message.author.id}> has been verified.`,true,client)
            

            return message.reply("**ID succesfully activated!** You now have access to the server! Please make sure to read rules and set your roles in #roles.\nIf you ever switch discord accounts, use __!unverify__ to unlink your ID.\n**__Welcome to the Yale Class of 2025!__**")
        }
        catch (e){
            if (e.name === 'SequelizeUniqueConstraintError'){
                return message.reply('This id has already been taken or you have been already verified.');
            }
            client.log('error',e)
            return message.reply("Error has Occured. Please contact an Admin.")
        }

    },
}