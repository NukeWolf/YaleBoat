const Sequelize = require('sequelize')

module.exports.init = () => {
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


    function sync() {
        this.Users.sync()
    }

    return {sequelize,Users,sync}
}
    
