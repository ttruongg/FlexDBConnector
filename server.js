const express = require("express");

const propertiesReader = require("properties-reader");
const properties = propertiesReader("config.properties");

const dbType = properties.get("database.type");

const app = express();
app.use(express.json());

console.log(dbType);

require("./app/routes/data_Routes.js")(app);

app.get("/", (req, res) => {
  res.json({ message: "Welcome" });
});

const port = process.env.port || 8080;
app.listen(port, () => {
  console.log("Server is running on port: " + port);
});
