const dbConfig = require("../db/mongoConfig.js");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.user = require("../model/mongoModel.js")(mongoose)


const User = db.user;
exports.create = (req, res) => {
    if (!req.body.title){
        res.status(400).send({message: "Can not empty"});
        return;
    }

    //create
    const user = new User({
        name: req.body.name,
        age: req.body.age,
        email: req.body.email
    });

    //save
    user.save(user)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Error occurred"
            });
        });

};


exports.findAll = (req, res) => {
    const name = req.query.name;
    var condition = name ? { name: { $regex: new RegExp(name), $options: "i" } } : {};
    User.find(condition)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "error occurred"
            });
        });
    
};



