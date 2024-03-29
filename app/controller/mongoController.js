const dbConfig = require("../db/mongoConfig.js");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.user = require("../model/mongoModel.js")(mongoose);

const User = db.user;

exports.findAll = (req, res) => {
  const name = req.query.name;
  var condition = name
    ? { name: { $regex: new RegExp(name), $options: "i" } }
    : {};
  User.find(condition)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "error occurred",
      });
    });
};

exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not empty!",
    });
  }

  const id = req.params.id;
  User.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `there is not this id = ${id}. Can not update`,
        });
      } else res.send({ message: "Updated successfully" });
    })
    .catch((err) => {
      res.status(500).send({
        message: "update error with id = " + id,
      });
    });
};

exports.delete = async (req, res) => {
  const { collection, _id, condition } = req.body;

  try {
    let filter = {}; 

    if (_id) {
      
      if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(400).json({ error: "Invalid document ID" });
      }
      
      filter._id = mongoose.Types.ObjectId(_id);
    }

   
    if (condition) {
      filter = { ...filter, ...condition };
    }

    
    const result = await mongoose.connection.db
      .collection(collection)
      .deleteOne(filter);

    
    if (result.deletedCount === 1) {
      res.json({ message: "Deleted successfully!" });
    } else {
      res.status(404).json({ error: "Document not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.executeQuery = async (req, res) => {
  const { collection, query } = req.body;

  try {
    const result = await mongoose.connection.db
      .collection(collection)
      .find(query)
      .toArray();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.insertRecord = async (req, res) => {
  const { collection, records } = req.body;

  try {
    const existingCollection = mongoose.connection.collections[collection];
    if (!existingCollection) {
      await mongoose.connection.createCollection(collection);
    }

    await mongoose.connection.collection(collection).insertMany(records);

    res.json({ message: "Data inserted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
