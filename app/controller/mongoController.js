const dbConfig = require("../db/mongoConfig.js");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const propertiesReader = require("properties-reader");
const properties = propertiesReader("config.properties");

const dbType = properties.get("database.type");

// const db = {};
// db.mongoose = mongoose;
// db.url = dbConfig.url;
// db.user = require("../model/mongoModel.js")(mongoose);

//const User = db.user;

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

exports.update = async (req, res) => {
  const { collection, _id, values } = req.body;

  try {
    let filter = {};

    // Kiểm tra xem id có hợp lệ không
    if (_id) {
      if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(400).json({ error: "Invalid document ID" });
      }

      filter._id = new mongoose.Types.ObjectId(_id);
    } else {
      return res.status(400).json({ error: "Document ID is required" });
    }

    if (!values || Object.keys(values).length === 0) {
      return res.status(400).json({ error: "No update fields provided" });
    }

    // Thực hiện cập nhật
    const result = await mongoose.connection.db
      .collection(collection)
      .updateOne(
        filter, // Bộ lọc để xác định tài liệu cần cập nhật
        { $set: values } // Các trường cập nhật
      );

    // Kiểm tra xem có tài liệu nào được cập nhật hay không
    if (result.modifiedCount === 1) {
      res.json({ message: "Document updated successfully!" });
    } else {
      res
        .status(404)
        .json({ error: "Document not found or no changes were made" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  const { collection, _id, condition } = req.body;

  try {
    let filter = {};

    if (_id) {
      if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(400).json({ error: "Invalid document ID" });
      }

      filter._id = new mongoose.Types.ObjectId(_id);
    }

    if (condition) {
      filter = { ...filter, ...condition };
    }

    const result = await mongoose.connection.db
      .collection(collection)
      .deleteOne(filter);

    if (result.deletedCount === 1) {
      res.json({ message: "Deleted successfully!" });
      deleteUser(collection, _id);
    } else {
      res.status(404).json({ error: "Document not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

async function deleteUser(collection, userId) {
  // const db = await connectToDatabase();
  try {
    await mongoose.connection.db
      .collection(collection)
      .deleteMany({ user_id: userId });
    console.log("User and related jobs deleted successfully");
  } catch (error) {
    console.error("Error deleting user and related jobs:", error);
    throw error;
  }
}

exports.executeQuery = async (req, res) => {
  const { collection, query } = req.body;

  if (dbType === "mongodb") {
    try {
      const result = await mongoose.connection.db
        .collection(collection)
        .find(query)
        .toArray();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    

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

exports.aggregate = async (req, res) => {
  const { collection, pipeline } = req.body;

  try {
    if (!pipeline || !Array.isArray(pipeline)) {
      return res.status(400).json({ error: "Pipeline must be an array" });
    }

    const result = await mongoose.connection.db
      .collection(collection)
      .aggregate(pipeline)
      .toArray();

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
