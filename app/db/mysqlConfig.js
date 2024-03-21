const mysql = require('mysql2');
const propertiesReader = require("properties-reader");
const properties = propertiesReader("config.properties");

const connection = mysql.createConnection({
  host: properties.get('mysql.host'),
  port: properties.get('mysql.port'),
  user: properties.get('mysql.user'),
  password: properties.get('mysql.password'),
  database: properties.get('mysql.database')

});

module.exports = connection;
