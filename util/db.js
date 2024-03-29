const Sequelize = require("sequelize");

module.exports.init = () => {
    var sequelize = null;
    if (process.env.DATABASE_URL) {
        sequelize = new Sequelize(process.env.DATABASE_URL, {
            dialect: "postgres",
            protocol: "postgres",
            logging: false, //false
            dialectOptions: {
                ssl: {
                    require: true,
                    rejectUnauthorized: false,
                },
            },
        });
    } else {
        sequelize = new Sequelize("database", "user", "password", {
            host: "localhost",
            dialect: "sqlite",
            logging: false,
            // SQLite only
            storage: "database.sqlite",
        });
    }

    const Users = sequelize.define("users", {
        user_id: {
            type: Sequelize.STRING,
            primaryKey: true,
        },
        uuid: {
            type: Sequelize.STRING,
            unique: true,
        },
        email: {
            type: Sequelize.STRING,
            unique: true,
        },
        malicious: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
        courses: {
            type: Sequelize.JSON,
        },
        authCode: {
            type: Sequelize.STRING,
        },
        verified: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
    });
    const Guilds = sequelize.define("guilds", {
        id: {
            type: Sequelize.STRING,
            primaryKey: true,
        },
        config: {
            type: Sequelize.JSON,
        },
    });

    function sync() {
        this.Users.sync({ alter: true });
        this.Guilds.sync({ alter: true });
    }

    return { sequelize, Users, Guilds, sync };
};
