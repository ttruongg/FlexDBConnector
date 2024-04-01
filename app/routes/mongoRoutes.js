module.exports = (app) => {
    const user = require("../controller/mongoController");

    var router = require("express").Router();

    //findAll
    router.get("/data/mongo", user.findAll);

    //update
    router.post("/data/mongo/update", user.update);

    //deletes
    router.post("/data/mongo/delete", user.delete);

    //find
    router.post("/data/mongo/find", user.executeQuery);
    
    //insert 
    router.post("/data/mongo/insert", user.insertRecord);

    app.use("/api/user", router);


}