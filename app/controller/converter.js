const { operators } = require("../model/operators");

function convertToMySQL(collection, pipeline) {
  let sqlQuery = `SELECT * FROM ${collection}`;
  const operators = {
    $match: convertMatch,
    $group: convertGroup,
    $sort: convertSort,
    $limit: convertLimit,
    $project: convertProject,
  };

  pipeline.forEach((stage) => {
    for (const key in stage) {
      if (stage.hasOwnProperty(key)) {
        const operator = operators[key];
        if (operator) {
          if (key === "$match") {
            const condition = convertMatch(sqlQuery, stage[key]);
            sqlQuery += " where " + condition;
          } else if (key === "$limit") {
            sqlQuery += " limit " + stage[key];
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

function convertLimit(sqlQuery, limitStage) {
  sqlQuery += " limit " + limitStage["$limit"];
  return sqlQuery;
}

function convertProject(sqlQuery, projectStage) {
  let selectFields = "";

  for (const key in projectStage) {
    if (projectStage.hasOwnProperty(key) && projectStage[key] === 1) {
      selectFields += `${key}, `;
    }
  }

  if (selectFields !== "") {
    sqlQuery = sqlQuery.replace(
      /SELECT \* FROM/,
      `SELECT ${selectFields.slice(0, -2)} FROM`
    );
  }

  return sqlQuery;
}

function getAggregationFunction(aggregationKey) {
  switch (aggregationKey) {
    case "$sum":
      return "SUM";
    case "$avg":
      return "AVG";
    case "$min":
      return "MIN";
    case "$max":
      return "MAX";
    default:
      throw new Error(`Unsupported aggregation function: ${aggregationKey}`);
  }
}

function convertGroup(sqlQuery, groupStage) {
  let groupByClause = "";
  let selectClause = "SELECT ";

  for (const key in groupStage) {
    if (groupStage.hasOwnProperty(key)) {
      if (key === "_id") {
        groupByClause += `${groupStage[key]} `;
        selectClause += `${groupStage[key]}, `;
      } else {
        for (const aggregationKey in groupStage[key]) {
          if (groupStage[key].hasOwnProperty(aggregationKey)) {
            const aggregationFunction = getAggregationFunction(aggregationKey);
            const field = groupStage[key][aggregationKey];
            selectClause += `${aggregationFunction}(${field}) AS ${key}, `;
          }
        }
      }
    }
  }

  if (groupByClause !== "") {
    sqlQuery = `${selectClause.slice(0, -2)} FROM ${
      sqlQuery.split(" ")[3]
    } GROUP BY ${groupByClause}`;
  }

  return sqlQuery;
}

module.exports = { convertToMySQL };
