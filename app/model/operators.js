const operators = [
  { mongodb: "$eq", mysql: "=" },
  { mongodb: "$gt", mysql: ">" },
  { mongodb: "$lt", mysql: "<" },
  { mongodb: "$gte", mysql: ">=" },
  { mongodb: "$lte", mysql: "<=" },
  { mongodb: "$ne", mysql: "!=" },
];

const typeMapping = {
  'string': 'varchar(255)',
  'number': 'int',
  'boolean': 'boolean'
  // other
}

function convertQuery(jsonQuery) {
  const { collection, query } = jsonQuery;
  const mysqlQuery = [];

  for (const key in query) {
    if (key === "$or" || key === "$and") {
      const subQueries = query[key].map((item) =>
        convertQuery({ collection, query: item })
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

function getColumnType(value){
  const type = typeof value;
  return typeMapping[type];
}

function convertDateFields(records) {
  return records.map(record => {
      const newRecord = { ...record };
      for (const key in newRecord) {
          if (isDateString(newRecord[key])) {
              newRecord[key] = new Date(newRecord[key]);
          }
      }
      return newRecord;
  });
}


function isDateString(value){
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}





module.exports = {convertQuery, typeMapping, getColumnType, convertDateFields};
