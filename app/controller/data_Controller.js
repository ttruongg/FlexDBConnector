const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const propertiesReader = require("properties-reader");
const properties = propertiesReader("config.properties");

const dbType = properties.get("database.type");
const convert = require("../converter/operators.js");
const { convertToMySQL } = require("../converter/converter.js");
const { initTable } = require("./table_initializer.js");
let config;

if (dbType === "mongodb") {
  config = require("../config/mongoConfig.js");
} else {
  config = require("../config/mysqlConfig.js");
  initTable(config);
}

/*
  This function supports retrieving data from a collection
  request with collection(table) name
  response all data from that collection(table)
*/
exports.findAll = async (req, res) => {
  try {
    const { collection } = req.body;
    if (dbType === "mongodb") {
      const result = await mongoose.connection.db
        .collection(collection)
        .find()
        .toArray();

      res.json(result);
    } else {
      const sqlQuery = `SELECT * FROM ${collection}`;
      config.query(sqlQuery, (error, results) => {
        if (error) {
          console.error("Error executing SQL query: " + error.message);
          res.status(500).json({ success: false, error: error.message });
          console.log(sqlQuery);
          return;
        }
        console.log(sqlQuery);
        res.json(results);
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/*
  This function supports updating data
  request includes collection(table) name, primary key, value
  response: updated successfully or not 
*/
exports.update = async (req, res) => {
  const { collection, _id, values } = req.body;
  const keys = Object.keys(req.body);

  try {
    if (dbType === "mongodb") {
      let filter = {};

      // id have to be ObjectID
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

      // Implement update
      const result = await mongoose.connection.db
        .collection(collection)
        .updateOne(
          filter, // the filter to determine record to be updated
          { $set: values } // fields need to be updated
        );

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

      updateString = `UPDATE ${collection} set ${updateValues} where ${
        keys[1]
      } = ${req.body[keys[1]]}`;
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

/*
  This function supports deleting data
  request includes collection(table) name, primary key
  reponse: successfully or not
*/
exports.delete = async (req, res) => {
  const { collection, _id, condition } = req.body;

  try {
    if (dbType === "mongodb") {
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
      } else {
        res.status(404).json({ error: "Document not found" });
      }
    } else {
      deleteString = `DELETE FROM ${collection} where _id = ${_id}`;
      config.query(deleteString, (error, results) => {
        if (error) {
          console.error("Error deleting :", error);
          res.status(500).json({ error: "Error deleting " });
          return;
        }
        res.json({ message: "deleted successfully" });
      });

    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/*
  This function supports query data by condition.
  The request includes the collection (table) name you want to 
  query data from and the conditions of the query
  The response is query result based on the conditions.

*/
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
      const condition = convert.convertOperator(req.body);
      const sqlString = `SELECT * FROM ${collection} WHERE ${condition}`;
      config.query(sqlString, (error, results) => {
        if (error) {

          console.error("Error executing SQL query: " + error.message);
          console.log(sqlString);
          res.status(500).json({ success: false, error: error.message });
          return;
        }
        console.log(sqlString);
        res.json({ success: true, results });
      });
    }
  } catch (error) {
    console.log(sqlString);
    res.status(500).json({ success: false, error: error.message });
  }
};

/*
  This function supports insert data.
  The request includes the collection(table) name and data need to be inserted.
  The response is successfully or not.
*/
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
            _id INT AUTO_INCREMENT PRIMARY KEY,
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
    const values = records.map((record) => {
      const recordValues = Object.values(record).map((value) => {
        if (convert.isArray(value)) {
          return convert.arrayToJsonArray(value);
        } else if (typeof value === "object") {
          return convert.objectToJson(value);
        } else if (convert.getColumnType(value) === "date") {
          return new Date(value);
        }
        return value;
      });
      return recordValues;
    });

    const insertQuery = `INSERT INTO ${collection} (${Object.keys(
      records[0]
    ).join(", ")}) VALUES ?`;
    config.query(insertQuery, [values], (err, result) => {
      if (err) {
        //console.log(insertQuery);
        console.error("Error when inserting data", err);
        res.status(500).json({ error: "Error when inserting data" });
        return;
      }
      console.log("Data inserted successfully:", result);
      res.json({ message: "Data inserted successfully" });
    });
  }
};

/*
  This function allow you to group, sort, perform calculations, analyze data, and much more.
  The request includes the collection(table) name and operators.
  The response is query result based on the operators.
*/

exports.aggregate = async (req, res) => {
  const { collection, pipeline } = req.body;

  if (!pipeline || !Array.isArray(pipeline)) {
    return res.status(400).json({ error: "Pipeline must be an array" });
  }
  try {
    if (dbType === "mongodb") {
      const result = await mongoose.connection.db
        .collection(collection)
        .aggregate(pipeline)
        .toArray();

      res.json(result);
    } else {
      const sqlQuery = convertToMySQL(collection, pipeline);
      if (!sqlQuery) {
        return res
          .status(500)
          .json({ error: "Failed to convert pipeline to SQL" });
      }
      config.query(sqlQuery, (error, results) => {
        if (error) {
          console.error("Error executing SQL query: " + error.message);
          res.status(500).json({ success: false, error: error.message });
          console.log(sqlQuery);
          return;
        }
        console.log(sqlQuery);
        res.json(results);
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
