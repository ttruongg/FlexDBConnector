module.exports = (app) => {
    const user = require("../controller/mongoController");

    var router = require("express").Router();

    //create
    router.post("/data/mongo", user.create);

    //findAll
    router.get("/data/mongo", user.findAll);

    //update
    router.put("/data/mongo/:id", user.update);

    //delete
    router.delete("/data/mongo/:id", user.delete);
    

    app.use("/api/user", router);


}