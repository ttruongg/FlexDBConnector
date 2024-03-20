const mysql = require('mysql');
const propertiesReader = require('properties-reader');
const properties = propertiesReader('config.properties');


const mysqlConfig = {
    host: properties.get('mysql.host'),
    port: properties.get('mysql.port'),
    user: properties.get('mysql.user'),                    
    password: properties.get('mysql.password'),
    database: properties.get('mysql.database')
};


const mysqlConnecttion = mysql.createConnection(mysqlConfig);

module.exports = mysqlConnecttion;


