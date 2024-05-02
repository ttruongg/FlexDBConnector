const express = require("express");

const propertiesReader = require("properties-reader");
const properties = propertiesReader("config.properties");

const dbType = properties.get("database.type");

const app = express();
app.use(express.json());

console.log(dbType);

const get = require("./app/controller/initTable.js");

// Lấy thông tin của các bảng từ file properties
const sections = get.getAllSections("tables.properties");
console.log(sections); 


const test = get.getTablesAndProperties("tables.properties");
console.log(test);

require("./app/routes/mongoRoutes.js")(app);

app.get("/", (req, res) => {
  res.json({ message: "Welcome" });
});

const port = process.env.port || 8080;
app.listen(port, () => {
  console.log("Server is running on port: " + port);
});
