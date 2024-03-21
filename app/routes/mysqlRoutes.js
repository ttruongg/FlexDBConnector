module.exports = (app) => {
    const user = require('../controller/mysqlController');

    var router = require('express').Router();

    router.get("/data/mysql", user.getAllUsers);



    app.use("/api/user", router);
};