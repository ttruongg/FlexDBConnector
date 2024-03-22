const mongoose = require('mongoose');
const propertiesReader = require('properties-reader');
const properties = propertiesReader('config.properties');

//    "mongodb://localhost:27017/wecommit"
const url = "mongodb://" + properties.get('mongodb.host') + ":" + properties.get('mongodb.port') + "/" + properties.get('mongodb.database');

// const mongoCongfig = {
//     //connectionString: // connection string
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     dbName: 'your_mongodb_database',
//     user: 'your_mongodb_username',
//     pass: 'your_mongodb_password',
//     // các option khác

// };

mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
    // các option khác 
    })
    .then(() => {
        console.log("Connected to the mongodb!");
    })
    .catch(err => {
        console.log("Cannot connect to the mongodb");
        process.exit();
    });

const mongoConnection = mongoose.connection;

module.exports = {url, mongoConnection};





