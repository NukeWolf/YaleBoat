const winston = require('winston')
const format = winston.format
const { mainGuild, adminChannel } = require('../config.json')
const logger = winston.createLogger({
    levels:{
        'info': 3,
        'verification':2,
        'malicious':1,
        'error' : 0,
    },
	transports: [
		new winston.transports.Console({'timestamp':true}),
        new winston.transports.File({ filename: 'log' }),
        new winston.transports.File({ filename: 'log', level:'verification' }),
	],
	format: format.combine(format.timestamp(),format.printf(log => `${log.timestamp} [${log.level.toUpperCase()}] - ${log.message}`)),
});

const log = (type,message,sendDiscord,client) =>{
    logger.log(type,message)
    if(sendDiscord){
        client.guilds.fetch(mainGuild).then(guild => {
            guild.channels.resolve(adminChannel).send(`[${type.toUpperCase()}] - ${message}`)
        })
    }
}

module.exports = log