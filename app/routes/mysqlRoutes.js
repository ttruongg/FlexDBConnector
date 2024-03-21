module.exports = (app) => {
    const user = require('../controller/mysqlController');

    var router = require("express").Router();

    router.get("/data/mysql", user.getAll);



    app.use("/api/user", router);
}