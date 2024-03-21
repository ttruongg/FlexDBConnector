const { sequelize, Sequelize } = require("../controller/mysqlController");

module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("user", {
        name: {
            type: Sequelize.STRING
        },
        age: {
            type: Sequelize.NUMBER
        },
        email: {
            type: Sequelize.STRING
        }

    });

    return User;
};