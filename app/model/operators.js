const operators = [
  { mongodb: "$eq", mysql: "=" },
  { mongodb: "$gt", mysql: ">" },
  { mongodb: "$lt", mysql: "<" },
  { mongodb: "$gte", mysql: ">=" },
  { mongodb: "$lte", mysql: "<=" },
  { mongodb: "$ne", mysql: "!=" },
];

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

module.exports = convertQuery;
