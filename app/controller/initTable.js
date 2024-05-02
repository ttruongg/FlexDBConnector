const PropertiesReader = require("properties-reader");

function getAllSections(filePath) {
  const properties = PropertiesReader(filePath);
  const allProperties = properties.getAllProperties();
  const sections = [];

  for (const property in allProperties) {
    if (property.includes(".")) {
      const groupName = property.split(".")[0];
      if (!sections.includes(groupName)) {
        sections.push(groupName);
      }
    }
  }

  return sections;
}

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


module.exports = {
  getAllSections,
  getTablesAndProperties,
};
