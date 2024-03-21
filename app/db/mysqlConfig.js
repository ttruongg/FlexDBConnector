const mysql = require('mysql2/promise');
const propertiesReader = require("properties-reader");
const properties = propertiesReader("config.properties");

const pool = mysql.createPool({
  host: properties.get('mysql.host'),
  user: properties.get('mysql.user'),
  password: properties.get('mysql.password'),
  database: properties.get('mysql.database')
});
