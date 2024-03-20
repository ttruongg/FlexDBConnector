module.exports = (app) => {
    const user = require("../controller/mongoController");

    var router = require("express").Router();

    //create
    router.post("/data/mongo", user.create);

    //findAll
    router.get("/data/mongo", user.findAll);


    

    app.use("/api/user", router);


}