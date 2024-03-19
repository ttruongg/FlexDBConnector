const express = require('express')
const app = express();


app.get('/', (req, res) => {
    res.send("Welcome");
})

const port = process.env.port || 8080;
app.listen(port, () => {
    console.log("Server is running on port: " + port);
})