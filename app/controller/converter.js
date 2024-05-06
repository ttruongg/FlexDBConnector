const { operators } = require("../model/operators");

function convertToMySQL(collection, pipeline) {
  let sqlQuery = `SELECT * FROM ${collection}`;
  const operators = {
    $match: convertMatch,
    $group: convertGroup,
    $sort: convertSort,
    //  '$lookup': convertLookup,
    //
  };

  pipeline.forEach((stage) => {
    for (const key in stage) {
      if (stage.hasOwnProperty(key)) {
        const operator = operators[key];
        if (operator) {
          if (key === "$match") {
            const condition = convertMatch(sqlQuery, stage[key]);
            sqlQuery += " where " + condition;
          } else {
            sqlQuery = operator(sqlQuery, stage[key]);
          }
        } else {
          throw new Error(`Unsupported pipeline stage: ${key}`);
        }
      }
    }
  });

  return sqlQuery;
}

function convertMatch(sqlQuery, matchStage) {
  const mysqlQuery = [];

  for (const key in matchStage) {
    if (key === "$or" || key === "$and") {
      const subQueries = matchStage[key].map((item) =>
        convertMatch(sqlQuery, item)
      );
      mysqlQuery.push(
        `(${subQueries.join(` ${key.slice(1).toUpperCase()} `)})`
      );
    } else {
      for (const field in matchStage[key]) {
        const value = matchStage[key][field];
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

function convertGroup(sqlQuery, groupStage) {
  let groupFields = "";
  for (const key in groupStage) {
    if (groupStage.hasOwnProperty(key)) {
      if (groupFields !== "") {
        groupFields += ", ";
      }
      groupFields += key;
    }
  }
  if (groupFields !== "") {
    sqlQuery += ` GROUP BY ${groupFields}`;
  }
  return sqlQuery;
}

function convertSort(sqlQuery, sortStage) {
  let orderByClause = "";
  for (const key in sortStage) {
    if (sortStage.hasOwnProperty(key)) {
      if (orderByClause !== "") {
        orderByClause += ", ";
      }
      orderByClause += `${key} ${sortStage[key] === 1 ? "ASC" : "DESC"}`;
    }
  }
  if (orderByClause !== "") {
    sqlQuery += ` ORDER BY ${orderByClause}`;
  }
  return sqlQuery;
}

module.exports = { convertToMySQL };
