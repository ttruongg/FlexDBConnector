const mysql = require('mysql');

const mysqlModel = {
    createTable: function() {
        const sql = `
            CREATE TABLE IF NOT EXISTS your_table (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                age INT NOT NULL,
                email VARCHAR(255) NOT NULL
            )
        `;
        mysqlConnection.query(sql, (error, results) => {
            if (error) throw error;
            console.log('Table created successfully');
        });
    }
};

module.exports = mysqlModel;