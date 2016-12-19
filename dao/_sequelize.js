var node_env=process.env.NODE_ENV ? process.env.NODE_ENV:'dev';
var config=require('../config/mysqlConfig.json')[node_env];
var Sequelize=require('sequelize');

var sequelize =new Sequelize(
    config.database,
    config.username,
    config.password,
    {
        host:config.host,
        port:config.port,
        timzezone:config.timezone,
        dialect:config.dialect,
        pool:{
            maxConnections:config.maxConnections,
            maxIdleTime:config.maxIdleTime
        }
    }
);
module.exports=sequelize;
