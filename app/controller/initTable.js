// //const db = propertiesReader("config.properties").get("database.type");


// function initTables() {
//   const propertiesReader = require("properties-reader");
//   const properties = propertiesReader("tables.properties");
//   const config = require("../db/mysqlConfig.js");

//   let createTableQueries = [];

//   // Lặp qua tất cả các bảng trong file properties
//   properties.each((key, value) => {
//     // Nếu key là 'tablename', bắt đầu xử lý bảng mới
//     if (key === "tablename") {
//       let tableName = value;
//       let columns = [];
//       let primaryKey = null;
//       let foreignKeys = [];

      
//       properties.each((innerKey, innerValue) => {
//         if (innerKey !== "tablename") {
//           if (innerKey === "primaryKey") {
//             primaryKey = innerValue;
//           } else if (innerKey === "foreignKeys") {
//             const [refTable, refColumn] = innerValue.split(".");
//             foreignKeys.push({
//               referenceTable: refTable.trim(),
//               referenceColumn: refColumn.trim(),
//             });
//           } else {
//             columns.push(`${innerKey} ${innerValue}`);
//           }
//         }
//       });

      
//       let query = `CREATE TABLE ${tableName} (\n`;
//       query += columns.join(",\n");
//       if (primaryKey) {
//         query += `,\nPRIMARY KEY (${primaryKey})`;
//       }
//       if (foreignKeys.length > 0) {
//         foreignKeys.forEach((fk) => {
//           query += `,\nFOREIGN KEY (${fk.referenceColumn}) REFERENCES ${fk.referenceTable}(${primaryKey})`;
//         });
//       }
//       query += "\n);";

//       // Thêm câu lệnh tạo bảng vào mảng
//       createTableQueries.push(query);
//     }

//     createTableQueries.forEach((query) => {
//       console.log(query);
//     });
//   });

//   //   properties.each((key, value) => {
//   //     let createQuery = "";
//   //     if (key === 'tablename') {
//   //         createQuery += `create table ${properties.get('tablename')} (`
//   //     }
//   //   })

//   //   console.log();
//   //   properties.each((key, value) => {
//   //     console.log(key + ":" + value);
//   //   });
// }

// module.exports = { initTables };
