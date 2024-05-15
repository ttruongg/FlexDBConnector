module.exports = (app) => {
    const model = require("../controller/data_Controller");

    var router = require("express").Router();

    //findAll
    router.get("/data", model.findAll);

    //update
    router.post("/data/update", model.update);

    //deletes
    router.post("/data/delete", model.delete);

    //find
    router.post("/data/find", model.executeQuery);
    
    //insert 
    router.post("/data/insert", model.insertRecord);

    //aggregate
    router.post("/data/aggregate", model.aggregate);

    app.use("/api/user", router);


}