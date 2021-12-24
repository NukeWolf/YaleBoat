const winston = require("winston");
const format = winston.format;
const { adminChannel } = require("../config");
const logger = winston.createLogger({
    levels: {
        info: 3,
        verification: 2,
        malicious: 1,
        error: 0,
    },
    transports: [
        new winston.transports.Console({ timestamp: true }),
        new winston.transports.File({ filename: "log" }),
        new winston.transports.File({ filename: "log", level: "verification" }),
    ],
    format: format.combine(
        format.timestamp(),
        format.printf(
            (log) =>
                `${log.timestamp} [${log.level.toUpperCase()}] - ${log.message}`
        )
    ),
});

function log(type, message, guild) {
    logger.log(type, message);
    if (guild) {
        guild.logChannel.send(`[${type.toUpperCase()}] - ${message}`);
    }
}

module.exports = log;
