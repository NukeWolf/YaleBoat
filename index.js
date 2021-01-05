const fs = require('fs')
const Discord = require('discord.js');
const Sequelize = require('sequelize')
const {prefix,roleId} = require('./config.json')

const client = new Discord.Client();
client.commands = new Discord.Collection();
client.log = require('./scripts/log')

//Command Setup
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles){
    const command = require(`./commands/${file}`)
    client.commands.set(command.name,command)
}

//DB Setup
const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'database.sqlite',
});

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
});


client.once('ready', () =>{
    Users.sync();
    client.log("info","Bot is now Online!",true,client)
})


client.on('guildMemberAdd', async member => {
    const user = await Users.findOne({ where: { user_id: member.id } });
    if(user){
        if(user.get('malicious')){
            member.send("Welcome to the Yale 2025 Discord Server!\nIn order to verify your account, please DM one of the admins for assistance.")
        }
        else{
            member.roles.add(roleId)
            member.send("Welcome back to the Yale 2025 Discord Server! Please reassign your roles.")
        }
    }
    else{
        const embed = new Discord.MessageEmbed()
            .attachFiles(['./src/bulldog.jpg'])
            .setColor('#0a47b8')
            .setTitle('Welcome to the Yale 2025 discord server!')
            .setURL('https://apps.admissions.yale.edu/apply/update')
            .setDescription("In order to verify your account, we will need the link to your acceptance letter.")
            .addField('Login to your portal at this link and once logged in, copy the search bar.', '[https://apps.admissions.yale.edu/apply/update](https://apps.admissions.yale.edu/apply/update)')
            .addField('After copying the link, respond to this dm with the command !verify [URL]',"Ex. !verify https://apps.admissions.yale.edu/apply/update?idtoken=4101bef8794fed986e95dfb54850c68b")
            .addField('If the link says no update to your application status to report, use this link and navigate to the letter.', '[https://apps.admissions.yale.edu/apply](https://apps.admissions.yale.edu/apply)')
            .addField('Privacy', 'This ID you give is not linked to any of your personal information, nor allows to do anything with the application. It only tells us if your application exists.')
            .setImage('attachment://bulldog.jpg')
            .setTimestamp()
            .setFooter('*Your link may look a little different. UUIDv1');
        member.send(embed)
    }
    
})

client.on('message', async message =>{
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    if(!client.commands.has(commandName)) return;
    const command = client.commands.get(commandName)

    if(command.dmOnly && message.channel.type !== 'dm') return;
    //Malicious Check
    const user = await Users.findOne({ where: { user_id: message.author.id } });
    if(user && user.get('malicious')) return message.reply("There was an issue verifying your ID. Please contact an Admin for further assistance.");

    try{
        command.execute(client,message,args,Users);
    }
    catch (err){
        client.log('error',err);
        message.reply('There as an error executing your comamnd. Please contact an Admin.')
    }



})

client.login(process.env.BOT_TOKEN || require('./secret.json').token)