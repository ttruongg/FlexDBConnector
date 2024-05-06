const operators = [
  { mongodb: "$eq", mysql: "=" },
  { mongodb: "$gt", mysql: ">" },
  { mongodb: "$lt", mysql: "<" },
  { mongodb: "$gte", mysql: ">=" },
  { mongodb: "$lte", mysql: "<=" },
  { mongodb: "$ne", mysql: "!=" },
];

function convertOperator(jsonQuery) {
  const { collection, query } = jsonQuery;
  const mysqlQuery = [];

  for (const key in query) {
    if (key === "$or" || key === "$and") {
      const subQueries = query[key].map((item) =>
        convertOperator({ collection, query: item })
      );
      mysqlQuery.push(
        `(${subQueries.join(` ${key.slice(1).toUpperCase()} `)})`
      );
    } else {
      for (const field in query[key]) {
        const value = query[key][field];
        const operator = operators.find((op) => op.mongodb === field);
        if (operator) {
          mysqlQuery.push(`${key} ${operator.mysql} ${value}`);
        } else {
          console.error(`Unknown operator: ${field}`);
        }
      }
    }
  }

  return mysqlQuery.join(" AND ");
}

function convertDateFields(records) {
  return records.map((record) => {
    const newRecord = { ...record };
    for (const key in newRecord) {
      if (isDateString(newRecord[key])) {
        newRecord[key] = new Date(newRecord[key]);
      }
    }
    return newRecord;
  });
}

function isDateString(value) {
  if (typeof value !== "string") return false;

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const parts = value.split("/");
    const formattedValue = `${parts[2]}-${parts[0]}-${parts[1]}`;
    return /^\d{4}-\d{2}-\d{2}$/.test(formattedValue);
  }

  return false;
}

function isArray(value) {
  return Array.isArray(value);
}

function arrayToJsonArray(array) {
  return JSON.stringify(array);
}

function objectToJson(object) {
  return JSON.stringify(object);
}

function getColumnType(value) {
  if (typeof value === "number") return "int";
  if (typeof value === "boolean") return "boolean";
  if (Number(value)) return "int";
  if (Array.isArray(value) || typeof value === "object") return "json";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return "datetime";
  }
  if (/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(value)) {
    var d = new Date(value);
    if (d.toISOString() === value) return "datetime";
  }
  if (/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
    return "datetime";
  }
  if (/[a-zA-Z]{3}\s[a-zA-Z]{3}\s[0-9]{2}\s\d{4}\s\d{2}:\d{2}/.test(value)) {
    return "datetime";
  }
  return "varchar(250)";
}

module.exports = {
  convertOperator,
  //  typeMapping,
  isArray,
  arrayToJsonArray,
  objectToJson,
  getColumnType,
  convertDateFields,
  operators
};
