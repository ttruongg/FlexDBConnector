module.exports = (app) => {
    const user = require('../controller/mysqlController');

    var router = require("express").Router();

    router.post("data/mysql", user.create);


    app.use("/api/user", router);
}