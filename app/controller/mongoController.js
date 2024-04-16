//const dbConfig = require("../db/mongoConfig.js");

//const sqlConnection = require("../db/mysqlConfig.js");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const propertiesReader = require("properties-reader");
const properties = propertiesReader("config.properties");

const dbType = properties.get("database.type");
const convert = require("../model/operators.js");
// const db = {};
// db.mongoose = mongoose;
// db.url = dbConfig.url;
// //db.user = require("../model/mongoModel.js")(mongoose);

// const User = db.user;

let config;

if (dbType === "mongodb") {
  config = require("../db/mongoConfig.js");
} else {
  config = require("../db/mysqlConfig.js");
}

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
    if (dbType === "mongodb") {
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
    } else {
      const updateValues = Object.entries(values)
        .map(([key, value]) => `${key} = ${config.escape(value)}`)
        .join(", ");

      updateString = `UPDATE ${collection} set ${updateValues} where id = ${_id}`;
      config.query(updateString, (error, results) => {
        if (error) {
          console.error("Error updating user:", error);
          res.status(500).json({ error: "Error updating user" });
          return;
        }
        res.json({ message: "updated successfully" });
      });
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

  try {
    if (dbType === "mongodb") {
      const result = await mongoose.connection.db
        .collection(collection)
        .find(query)
        .toArray();
      res.json(result);
    } else {
      const condition = convert.convertQuery(req.body);
      sqlString = `SELECT * FROM ${collection} WHERE ${condition}`;
      console.log(sqlString);
      config.query(sqlString, (error, results) => {
        if (error) {
          console.error("Error executing SQL query: " + error.message);
          res.status(500).json({ success: false, error: error.message });
          return;
        }
        res.json({ success: true, results });
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.insertRecord = async (req, res) => {
  const { collection, records } = req.body;

  try {
    if (dbType === "mongodb") {
      const existingCollection = mongoose.connection.collections[collection];
      if (!existingCollection) {
        await mongoose.connection.createCollection(collection);
      }
      const recordsWithDateConverted = convert.convertDateFields(records);

      await mongoose.connection
        .collection(collection)
        .insertMany(recordsWithDateConverted);

      //await mongoose.connection.collection(collection).insertMany(records);

      res.json({ message: "Data inserted successfully" });
    } else {
      const checkTable = `SHOW TABLES LIKE '${collection}'`;
      config.query(checkTable, (err, rows) => {
        if (err) {
          console.error("Error query: ", err);
          res.status(500).json({ error: "Internal server error" });
          return;
        }

        if (rows.length === 0) {
          const createTable = `CREATE TABLE IF NOT EXISTS ${collection} (
            id INT AUTO_INCREMENT PRIMARY KEY,
            ${Object.entries(records[0])
              .map(([key, value]) => `${key} ${convert.getColumnType(value)}`)
              .join(",\n  ")}
          )`;

          config.query(createTable, (error, result) => {
            if (error) {
              console.error("Error when creating table", error);
              res.status(500).json({ error: "Internal server error" });
              return;
            }
            console.log("Table created");
            insertData();
          });
        } else {
          checkAndAddColumn();
        }
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

  function checkAndAddColumn() {
    const getColumns = `show columns from ${collection}`;
    config.query(getColumns, (err, results) => {
      if (err) {
        console.error("Error querying columns:", err);
        res.status(500).json({ error: "Internal server error" });
        return;
      }
      const existingColumns = results.map((column) => column.Field);
      const newColumns = Object.keys(records[0]).filter(
        (column) => !existingColumns.includes(column)
      );

      if (newColumns.length > 0) {
        const alterTableQuery = `ALTER TABLE ${collection} ADD COLUMN `;
        const columnDefinitions = newColumns
          .map(
            (column) => `${column} ${convert.getColumnType(records[0][column])}`
          )
          .join(", ");
        const fullQuery = `${alterTableQuery} ${columnDefinitions}`;
        config.query(fullQuery, (error) => {
          if (error) {
            console.error("Error adding columns:", error);
            res.status(500).json({ error: "Internal server error" });
            return;
          }
          console.log(
            `Added columns ${newColumns.join(", ")} to table '${collection}'`
          );
          insertData();
        });
      } else {
        insertData();
      }
    });
  }

  function insertData() {
    const insertQuery = `INSERT INTO ${collection} (${Object.keys(
      records[0]
    ).join(", ")}) VALUES ?`;
    const values = records.map((record) => Object.values(record));
    config.query(insertQuery, [values], (err, result) => {
      if (err) {
        console.log(insertQuery);
        console.error("Error when inserting data", err);
        res.status(500).json({ error: "Internal server error" });
        return;
      }
      console.log("Data inserted successfully:", result);
      res.json({ message: "Data inserted successfully" });
    });
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
