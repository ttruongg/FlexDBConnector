const PropertiesReader = require("properties-reader");

// get all table name from tables.properties file
// function getAllSections(filePath) {
//   const properties = PropertiesReader(filePath);
//   const allProperties = properties.getAllProperties();
//   const sections = [];

//   for (const property in allProperties) {
//     if (property.includes(".")) {
//       const groupName = property.split(".")[0];
//       if (!sections.includes(groupName)) {
//         sections.push(groupName);
//       }
//     }
//   }

//   return sections;
// }

/*
 get table and properties from tables.properties, 
 this function return an array of tables
*/
function getTablesAndProperties(filePath) {
  const properties = PropertiesReader(filePath);
  const allProperties = properties.getAllProperties();
  const tablesArray = [];

  for (const [key, value] of Object.entries(allProperties)) {
    const [tableName, property] = key.split(".");
    let currentTable = tablesArray.find(
      (table) => table.tablename === tableName
    );
    if (!currentTable) {
      currentTable = {
        tablename: tableName,
        columns: {},
        primaryKey: null,
        foreignKeys: {
          referenceTable: null,
          referenceColumn: null,
        },
      };
      tablesArray.push(currentTable);
    }

    if (property === "primaryKey") {
      currentTable.primaryKey = value;
    } else if (property.startsWith("foreignKeys")) {
      const fkProperty = key.split(".").pop();
      currentTable.foreignKeys[fkProperty] = value;
    } else {
      currentTable.columns[property] = value;
    }
  }

  return tablesArray;
}

/*
  use getTablesAndProperties function to get array of table
  implement create each table in array
*/
function initTable(config) {
  const tablesArray = getTablesAndProperties("tables.properties");

  tablesArray.forEach((table) => {
    const { tablename, columns, primaryKey, foreignKeys } = table;
    if (primaryKey !== "_id") {
      console.error(
        `The primary key column of table ${tablename} must be named _id. Please rename the primary key column to '_id' and try again.`
      );
      process.exit(1); 
    }
    let query = `CREATE TABLE IF NOT EXISTS ${tablename} (`;

    let isFirstColumn = true;
    Object.entries(columns).forEach(([columnName, columnType]) => {
      if (isFirstColumn) {
        query += `${columnName} ${columnType} AUTO_INCREMENT, `;
        isFirstColumn = false;
      } else {
        query += `${columnName} ${columnType}, `;
      }
    });

    query += `PRIMARY KEY (${primaryKey})`;

    if (
      foreignKeys.referenceTable &&
      foreignKeys.referenceColumn &&
      foreignKeys.field
    ) {
      query += `, FOREIGN KEY (${foreignKeys.field}) REFERENCES ${foreignKeys.referenceTable}(${foreignKeys.referenceColumn})`;
    }

    query += `)`;

    config.query(query, (err, result) => {
      if (err) {
        console.error(`Error when creating ${tablename}`, err);
        return;
      }
      console.log(`Table ${tablename} created successfully`, result);
      console.log(query);
    });
  });
}

module.exports = {
  // getAllSections,
  getTablesAndProperties,
  initTable,
};
