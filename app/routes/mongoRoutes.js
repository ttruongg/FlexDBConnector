module.exports = (app) => {
    const user = require("../controller/mongoController");

    var router = require("express").Router();

    //findAll
    router.get("/data/mongo", user.findAll);

    //update
    router.put("/data/mongo/:id", user.update);

    //delete
    router.delete("/data/mongo/:id", user.delete);

    //find
    router.post("/data/mongo/find", user.executeQuery);
    
    //insert 
    router.post("/data/mongo/insert", user.insertRecord);

    app.use("/api/user", router);


}