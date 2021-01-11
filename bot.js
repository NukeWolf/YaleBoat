const fs = require('fs')
const Discord = require('discord.js');
const Sequelize = require('sequelize')
const {prefix, roleId, mainGuild} = require('./config')
const inviteManager = require('./util/inviteManager')



const client = new Discord.Client();
client.commands = new Discord.Collection();
client.log = require('./util/log')

/**
 * Gets the main Yale 2025 Guild
 * @returns {Discord.Guild} 
 */
client.getMainGuild = () => { return client.guilds.fetch(mainGuild)
    .catch(e => {
        client.log('error',e)
        return message.reply("Error occurred attempting to set role.")
    })
}

//Command Setup
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles){
    const command = require(`./commands/${file}`)
    client.commands.set(command.name,command)
}

//DB Setup

var sequelize = null
if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect:  'postgres',
        protocol: 'postgres',
        logging:  false, //false
        dialectOptions: {
            ssl:{
                require: true,
                rejectUnauthorized: false
            }
            
        }
    })
}
else{
    sequelize = new Sequelize('database', 'user', 'password', {
        host: 'localhost',
        dialect: 'sqlite',
        logging: false,
        // SQLite only
        storage: 'database.sqlite',
    });
}

const Users = sequelize.define('users', {
	user_id: {
		type: Sequelize.STRING,
		primaryKey: true,
	},
	uuid: {
        type: Sequelize.STRING,
		unique: true,
    },
    rawLink: Sequelize.STRING,
    malicious: {
        type: Sequelize.BOOLEAN,
        defaultValue:false,
    },
    courses: {
        type: Sequelize.JSON,
    }
});

client.db = {Users , sequelize}


client.once('ready', () =>{
    Users.sync();
    client.log("info","Bot is now Online!",true)
    client.inviteManager = new inviteManager(client)
})

client.on('inviteCreate', invite => {
    client.inviteManager.onInviteCreate(invite)
})

client.on('guildMemberAdd', async member => {
    //Check Invite and update accordingly
    client.inviteManager.onUserJoin(member)

    const welcomeEmbed = new Discord.MessageEmbed()
            .attachFiles(['./src/bulldog.jpg'])
            .setColor('#0a47b8')
            .setTitle('Welcome to the Yale 2025 discord server!')
            .setURL('https://apps.admissions.yale.edu/apply/update')
            .setDescription("In order to verify your account, we will need the link to your acceptance letter.")
            .addField('Login to your portal at the link below and once logged in, copy the URL in the search bar.', '[https://apps.admissions.yale.edu/apply/update](https://apps.admissions.yale.edu/apply/update)')
            .addField('After copying the link, respond to this dm with the command !verify [URL]',"Ex. !verify https://apps.admissions.yale.edu/apply/update?idtoken=4101bef8794fed986e95dfb54850c68b")
            .addField('If the link says, "No update to your application status to report", use this alternative link below and navigate to the acceptance letter yourself, and then copy the URL.', '[https://apps.admissions.yale.edu/apply](https://apps.admissions.yale.edu/apply)')
            .addField('Privacy', 'The ID you give is not linked to any of your personal information, nor does it allows us access or modify with the application. Its only purpose is to check if your application exists.')
            .addField('Contact and Help',"If you need help with any of this, or can't access your portal, DM any of the admins on the server for verification help / admited role.")
            .setImage('attachment://bulldog.jpg')
            .setTimestamp()
            .setFooter('*Your link may look a little different. UUIDv1');
    //Apropriate Welcome message based on verification database.
    const user = await Users.findOne({ where: { user_id: member.id } });
    if(user){
        if(user.get('malicious')){
            member.send("Welcome to the Yale 2025 Discord Server!\nIn order to verify your account, please DM one of the admins for assistance.")
        }
        else if (user.get('uuid')){
            member.roles.add(roleId)
            member.send("Welcome back to the Yale 2025 Discord Server! Please reassign your roles.")
        }
        else{
        member.send(welcomeEmbed)
            .catch(e => {
                client.log("error", "Couldn't send welcome verification/message to "+member.toString()+".",true)
            })
        }
    }
    else {
        member.send(welcomeEmbed)
            .catch(e => {
                client.log("error", "Couldn't send welcome verification/message to "+member.toString()+".",true)
            })
    }   
        
    
})

client.on('message', async message =>{
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    //Finds Commands and exits early if no alias is found.
    const cmd = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases.includes(commandName))
    if(!cmd) return;

    //Checks for DM Only
    if(cmd.dmOnly && message.channel.type !== 'dm') return;
    //Malicious Check
    const user = await Users.findOne({ where: { user_id: message.author.id } });
    if(user && user.get('malicious')) return message.reply("There was an issue verifying your ID. Please contact an Admin for further assistance.");

    //Permission Check
    if(cmd.permissions){
        if(!message.member || !message.member.permissionsIn(message.channel).has(cmd.permissions))return;
    }

    try{
        cmd.execute(message,args);
    }
    catch (err){
        client.log('error',err);
        message.reply('There as an error executing your comamnd. Please contact an Admin.')
    }



})

client.login(process.env.BOT_TOKEN || require('./secret.json').token)