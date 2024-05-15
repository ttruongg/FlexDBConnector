const operators = [
  { mongodb: "$eq", mysql: "=" },
  { mongodb: "$gt", mysql: ">" },
  { mongodb: "$lt", mysql: "<" },
  { mongodb: "$gte", mysql: ">=" },
  { mongodb: "$lte", mysql: "<=" },
  { mongodb: "$ne", mysql: "!=" },
];

/**
 * convert operator in MongoDB to MySQL
 * @param {json} jsonQuery 
 * @returns condition string
 */
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
/*
  Convert string to date if the value is of data type 'date'.
*/
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

/* Check if value is an array */
function isArray(value) {
  return Array.isArray(value);
}

/* convert array to JsonArray */
function arrayToJsonArray(array) {
  return JSON.stringify(array);
}

/* convert object to Json, support store in MySQL */
function objectToJson(object) {
  return JSON.stringify(object);
}

/**
 * return data type of a value
 * @param {*} value 
 * @returns data type
 */
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
  isArray,
  arrayToJsonArray,
  objectToJson,
  getColumnType,
  convertDateFields,
  operators,
};
