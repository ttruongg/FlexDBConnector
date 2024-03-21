const db = require('../db/mysqlConfig');

exports.create = (req,res) => {
    const { name, age, email } = req.body;
    db.query('INSERT INTO users (name, age, email) VALUES (?, ?, ?)', [name, age, email], (err, result) => {
        if (err) {
            console.error('Error creating user:', err);
            res.status(500).json({ error: 'Error creating user' });
            return;
        }
        res.json({ id: result.insertId, name, age, email });
    });
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

exports.delete = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM users WHERE id = ?', [id], (err, result) => {
        if(err){
            console.log('Error deleting user: ', err);
            res.status(500).json({error: 'Error deleting user'});
            return;
        }
        res.json({message: 'User deleted successfully'});
    });
};

exports.update = (req, res) => {
    const userId = req.params.id; 
    const { name, age, email } = req.body; 

    db.query('UPDATE users SET name = ?, age = ?, email = ? WHERE id = ?', [name, age, email, userId], (err, result) => {
        if (err) {
            console.error('Error updating user:', err);
            res.status(500).json({ error: 'Error updating user' });
            return;
        }
        res.json({ message: 'User updated successfully' });
    });
};





