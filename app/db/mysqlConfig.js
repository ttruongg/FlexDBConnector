const mysql = require('mysql');


const mysqlConfig = {
    // host: 'localhost',
    // user: 'root',                    
    // password: 'password',
    // database: 'database_name'
};


const mysqlConnecttion = mysql.createConnection(mysqlConfig);

module.exports = mysqlConnecttion;


