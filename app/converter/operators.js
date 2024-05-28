const operators = [
  { mongodb: "$eq", mysql: "=" },
  { mongodb: "$gt", mysql: ">" },
  { mongodb: "$lt", mysql: "<" },
  { mongodb: "$gte", mysql: ">=" },
  { mongodb: "$lte", mysql: "<=" },
  { mongodb: "$ne", mysql: "!=" },
  { mongodb: "$regex", mysql: "REGEXP" },
  { mongodb: "$not", mysql: "NOT" },
  { mongodb: "$in", mysql: "IN" },
  { mongodb: "$nin", mysql: "NOT IN" },
  { mongodb: "$mod", mysql: "%" },
];

function convertWhere(whereClause) {
  whereClause = whereClause.replace(/&&/g, "AND");

  whereClause = whereClause.replace(
    /\.includes\((['"])(.*?)\1\)/g,
    " LIKE '%$2%'"
  );

  whereClause = whereClause.replace(/this\./g, "");

  return whereClause;
}

function convertDate(date) {
  return date.substring(0, 10);
}

/**
 * convert operator in MongoDB to MySQL
 * @param {json} jsonQuery
 * @returns condition string
 */
// function convertOperator(jsonQuery) {
//   const { collection, query } = jsonQuery;
//   const mysqlQuery = [];

//   for (const key in query) {
//     if (key === "$or" || key === "$and" || key === "$nor") {
//       const operator = key === "$nor" ? "NOT" : key.slice(1).toUpperCase();
//       const subQueries = query[key].map((item) =>
//         convertOperator({ collection, query: item })
//       );
//       mysqlQuery.push(
//         `(${subQueries.join(` ${key.slice(1).toUpperCase()} `)})`
//       );
//     } else {
//       for (const field in query[key]) {
//         const value = query[key][field];
//         if (field === "$regex") {
//           mysqlQuery.push(`${key} REGEXP '${value}'`);
//         } else if (field === "$not") {
//           if (typeof value === "object" && Object.keys(value).length > 0) {
//             for (const notField in value) {
//               const notValue = value[notField];
//               if (notField === "$regex") {
//                 mysqlQuery.push(`NOT ${key} REGEXP '${notValue}'`);
//               } else {
//                 console.error(`Unknown operator inside $not: ${notField}`);
//               }
//             }
//           }
//         } else {
//           const operator = operators.find((op) => op.mongodb === field);
//           if (operator) {
//             mysqlQuery.push(`${key} ${operator.mysql} ${value}`);
//           } else {
//             console.error(`Unknown operator: ${field}`);
//           }
//         }
//       }
//     }
//   }

//   return mysqlQuery.join(" AND ");
// }

function convertOperator(jsonQuery) {
  const { collection, query } = jsonQuery;
  const mysqlQuery = [];

  for (const key in query) {
    if (key === "$or" || key === "$and" || key === "$nor") {
      if (key === "$nor") {
        const norQueries = query[key].map(
          (item) => `(${convertOperator({ collection, query: item })})`
        );
        mysqlQuery.push(`NOT (${norQueries.join(" OR ")})`);
      } else {
        const operator = key === "$and" ? "AND" : "OR";
        const subQueries = query[key].map(
          (item) => `(${convertOperator({ collection, query: item })})`
        );
        mysqlQuery.push(`(${subQueries.join(` ${operator} `)})`);
      }
    } else if (key === "$expr") {
      const exprQueries = query[key]["$and"].map((expr) => {
        const operator = Object.keys(expr)[0];
        const operands = expr[operator];
        const op = operators.find((o) => o.mongodb === operator);
        if (!op) {
          throw new Error(`Unknown operator: ${operator}`);
        }
        const sqlOperands = operands.map((operand) => {
          if (typeof operand === "string" && operand.startsWith("$")) {
            return operand.substring(1);
          } else if (typeof operand === "number") {
            return operand;
          } else {
            throw new Error(`Unsupported operand type: ${typeof operand}`);
          }
        });
        return `(${sqlOperands.join(` ${op.mysql} `)})`;
      });
      mysqlQuery.push(`(${exprQueries.join(" AND ")})`);
    } else if (key === "$where") {
      const whereSQL = convertWhere(query[key]);
      mysqlQuery.push(`(${whereSQL})`);
    } else {
      for (const field in query[key]) {
        const value = query[key][field];

        let operator;
        for (const op of operators) {
          if (field === op.mongodb) {
            operator = op.mysql;
            break;
          }
        }

        if (!operator) {
          console.error(`Unknown operator: ${field}`);
          continue;
        }

        if (value instanceof Object && "$date" in value) {
          mysqlQuery.push(`${key} ${operator} DATE('${value["$date"]}')`);
          continue;
        }

        if (field === "$regex") {
          const regexValue = query[key]["$regex"];
          const options = query[key]["$options"];
          if (options && options.includes("i")) {
            mysqlQuery.push(`LOWER(${key}) REGEXP LOWER('${regexValue}')`);
          } else {
            mysqlQuery.push(`${key} REGEXP '${regexValue}'`);
          }
        } else if (field === "$not") {
          if (typeof value === "object" && Object.keys(value).length > 0) {
            const notQueries = [];
            for (const notField in value) {
              const notValue = value[notField];
              const operator = operators.find((op) => op.mongodb === notField);
              if (operator) {
                notQueries.push(`${key} ${operator.mysql} ${notValue}`);
              } else {
                console.error(`Unknown operator inside $not: ${notField}`);
              }
            }
            mysqlQuery.push(`NOT (${notQueries.join(" AND ")})`);
          }
        } else {
          const operator = operators.find((op) => op.mongodb === field);
          if (operator) {
            if (operator.mongodb === "$in" || operator.mongodb === "$nin")
              mysqlQuery.push(`${key} ${operator.mysql} (${value})`);
            else if (operator.mongodb === "$mod"){
              console.log("here");
              mysqlQuery.push(`${key} ${operator.mysql} ${value[0]} = ${value[1]} `);

            }
            else {
              mysqlQuery.push(`${key} ${operator.mysql} '${value}'`);
            }
          } else {
            console.error(`Unknown operator: ${field}`);
          }
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
