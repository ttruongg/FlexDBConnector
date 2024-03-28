const dbConfig = require("../db/mongoConfig.js");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.user = require("../model/mongoModel.js")(mongoose);

const User = db.user;
// exports.create = (req, res) => {
//   if (!req.body.name) {
//     res.status(400).send({ message: "Can not empty" });
//     return;
//   }

//   //create
//   const user = new User({
//     name: req.body.name,
//     age: req.body.age,
//     email: req.body.email,
//   });

//   //save
//   user
//     .save(user)
//     .then((data) => {
//       res.send(data);
//     })
//     .catch((err) => {
//       res.status(500).send({
//         message: err.message || "Error occurred",
//       });
//     });
// };

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

exports.delete = (req, res) => {
  const id = req.params.id;

  User.findByIdAndDelete(id)
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete  with id = ${id}.`,
        });
      } else {
        res.send({
          message: "deleted successfully!",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete with id=" + id,
      });
    });
};

//   const { collection, query } = req.body;

//   try {
//     if (collection !== User.collection.name) {
//       return res
//         .status(404)
//         .json({ error: `Collection '${collection}' not found` });
//     }

//     const result = await User.find(query).lean();
//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

//////////////////////// valid

exports.executeQuery = async (req, res) => {
  const { collection, query } = req.body;

  try {
    
    const result = await mongoose.connection.db.collection(collection).find(query).toArray();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



//   const { collection, fields } = req.body;

//   try {
//     if (collection !== User.collection.name) {
//       // Nếu collection chưa tồn tại, tạo collection mới
//       const newCollection = mongoose.model(collection, new mongoose.Schema({}));
//       await newCollection.createCollection();
//     }

//     const newDocument = new newCollection(fields);

//     await newDocument.save();

//     res.json({ message: "inserted successfully" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };


// exports.executeQuery = async (req, res) => {
//   const { collection, query } = req.body;

//   try {
//     let dbQuery = {};

    
//     for (const condition of query) {
      
//       if ('$or' in condition) {
       
//         dbQuery['$or'] = condition['$or'];
//       } else {
        
//         Object.assign(dbQuery, condition);
//       }
//     }

    
//     const result = await mongoose.connection.db.collection(collection).find(dbQuery).toArray();
//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

exports.insertRecord = async (req, res) => {
  const { collection, records } = req.body;

    try {
        
        const existingCollection = mongoose.connection.collections[collection];
        if (!existingCollection) {
            
            await mongoose.connection.createCollection(collection);
        }

        
        await mongoose.connection.collection(collection).insertMany(records);

        res.json({ message: 'Data inserted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
