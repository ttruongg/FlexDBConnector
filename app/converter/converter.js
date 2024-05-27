const { operators } = require("../converter/operators");

/* CONVERT QUERY FROM MONGODB TO MYSQL*/
function convertToMySQL(collection, pipeline) {
  let sqlQuery = `SELECT * FROM ${collection}`;
  const operators = {
    $match: convertMatch,
    $group: convertGroup,
    $having: convertHaving,
    $sort: convertSort,
    $limit: convertLimit,
    $project: convertProject,
    $lookup: convertLookup,
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

/**
 * Converts $match in MongoDB query to a MySQL query.
 *
 * @param {string} sqlQuery The MySQL query object.
 * @param {json} matchStage The MongoDB query object to be converted.
 * @returns {string} The converted MySQL query string.
 */
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
/**
 * Convert $sort in MongoDB to order by in MySQL
 * @param {string} sqlQuery is a query
 * @param {json} sortStage The MongoDB query object to be converted.
 * @returns {string} The converted MySQL query string.
 */
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

/**
 * Limits the number of documents returned
 * @param {string} sqlQuery is a query string
 * @param {json} limitStage The MongoDB query object to be converted.
 * @returns The converted MySQL query string.
 */
function convertLimit(sqlQuery, limitStage) {
  sqlQuery += " limit " + limitStage["$limit"];
  return sqlQuery;
}

/**
 * return the neccessary fields 
 * @param {*} sqlQuery is a query string
 * @param {*} projectStage The MongoDB query object to be converted.
 * @returns The converted MySQL query string.
 */
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

/**
 * 
 * @param {aggregationKey} aggregationKey are aggregation operators in MongoDB
 * @returns aggregate functions in MySQL
 */
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
/**
 * support group field 
 * @param {string} sqlQuery is a query string
 * @param {*} groupStage The MongoDB query object to be converted.
 * @returns The converted MySQL query string.
 */
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

/**
 * Operation with condition on groups
 * @param {*} sqlQuery is a query string
 * @param {*} havingStage The MongoDB query object to be converted.
 * @returns The converted MySQL query string.
 */
function convertHaving(sqlQuery, havingStage) {
  let havingCondition = "";

  for (const key in havingStage) {
    if (havingStage.hasOwnProperty(key)) {
      if (havingCondition !== "") {
        havingCondition += " AND ";
      }
      havingCondition += `${key} ${havingStage[key]}`;
    }
  }

  if (havingCondition !== "") {
    sqlQuery += ` HAVING ${havingCondition}`;
  }

  return sqlQuery;
}

/**
 * Support inner join, convert $lookup to inner join
 * @param {*} sqlQuery is a query string
 * @param {*} lookupStage The MongoDB query object to be converted.
 * @returns The converted MySQL query string.
 */
function convertLookup(sqlQuery, lookupStage) {
  const from = lookupStage.from;
  const localField = lookupStage.localField;
  const foreignField = lookupStage.foreignField;
  const as = lookupStage.as;

  let joinClause = `FROM ${sqlQuery.split(" ")[3]} inner join ${from} on ${
    sqlQuery.split(" ")[3]
  }.${localField} = ${from}.${foreignField}`;
  let tmp = `FROM ${sqlQuery.split(" ")[3]}`;
  sqlQuery = sqlQuery.replace(tmp, joinClause);

  return sqlQuery;
}

module.exports = { convertToMySQL };
