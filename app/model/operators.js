const operators = [
  { mongodb: "$eq", mysql: "=" },
  { mongodb: "$gt", mysql: ">" },
  { mongodb: "$lt", mysql: "<" },
  { mongodb: "$gte", mysql: ">=" },
  { mongodb: "$lte", mysql: "<=" },
  { mongodb: "$ne", mysql: "!=" },
];

// const typeMapping = {
//   string: "varchar(255)",
//   number: "int",
//   boolean: "boolean",
//   object: (value) => {
//     if (value instanceof Date) {
//       return "datetime";
//     }
//   },
//   // other
// };

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

function getColumnType(value) {
  if (typeof value === "string") {
    const date = new Date(value);

    if (!isNaN(date.getTime())) {
      return "date";
    } else {
      return "varchar(255)";
    }
  } else if (typeof value === "number") {
    return "int";
  } else if (typeof value === "boolean") {
    return "boolean";
  } else if (Array.isArray(value)) {
    return "array";
  } else {
    return "undefined";
  }

  // const type = typeof value;
  // if (isDateString(value)) {
  //   return "date";
  // } else if (Array.isArray(value)) {
  //   return "json";
  // }
  // return typeMapping[type];
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

// function isDateString(value) {
//   // const value = date.format(

//   //   new Date("December 17, 1995 03:24:00"),
//   //   "YYYY/MM/DD HH:mm:ss"
//   // );
//   return (
//     typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) //|| //  YYYY-MM-DD
//     // (typeof value === "string" && /^\d{2}-\d{2}-\d{4}$/.test(value)) || //  DD-MM-YYYY
//     // (typeof value === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(value)) //  MM/DD/YYYY
//   );
// }

// function isDateString(value) {
//   if (typeof value !== "string") return false;

//   if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
//     return true;
//   }

//   if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {

//     const parts = value.split("-");
//     const formattedValue = `${parts[2]}-${parts[1]}-${parts[0]}`;
//     return /^\d{4}-\d{2}-\d{2}$/.test(formattedValue);
//   }

//   if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {

//     const parts = value.split("/");
//     const formattedValue = `${parts[2]}-${parts[0]}-${parts[1]}`;
//     return /^\d{4}-\d{2}-\d{2}$/.test(formattedValue);
//   }

//   return false;
// }

module.exports = {
  convertQuery,
//  typeMapping,
  getColumnType,
  convertDateFields,
};
