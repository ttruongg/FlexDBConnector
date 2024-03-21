const db = require('../db/mysqlConfig');

exports.create = (req,res) => {
    
};


exports.getAllUsers = (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if(err){
            console.log('Error fetching users: ', err);
            res.status(500).json({error: 'Error fetching users'});
            return;
        }
        res.json(results);
    });
};