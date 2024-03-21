module.exports = (app) => {
    const user = require('../controller/mysqlController');

    var router = require('express').Router();

    
    router.post("/data/mysql", user.create);
    router.get("/data/mysql", user.getAllUsers);
    router.delete("/data/mysql/:id", user.delete);
    router.put("/data/mysql/:id", user.update);



    app.use("/api/user", router);
};