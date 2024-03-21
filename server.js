const express = require('express');

const propertiesReader = require('properties-reader');
const properties = propertiesReader('config.properties');


const dbType = properties.get('database.type')

const app = express();
app.use(express.json());

console.log(dbType);

if (dbType === 'mysql') {
    require('./app/db/mysqlConfig.js');
    require("./app/routes/mysqlRoutes.js")(app);
    
} else if (dbType === 'mongodb') {
    require('./app/db/mongoConfig.js');
    require("./app/routes/mongoRoutes.js")(app);
    
} else {
    console.log('Invalid database');
    process.exit(1);
}


app.get("/", (req, res) => {
    res.json({message: "Welcome"})
});

//require("./app/routes/mongoRoutes.js")(app)

const port = process.env.port || 8080;
app.listen(port, () => {
    console.log("Server is running on port: " + port);
})