const mongoose = require('mongoose');

const mongoCongfig = {
    //connectionString: //your connection string
};

mongoose.connect(mongoCongfig.connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});


const mongodb = mongoose.connection;

module.exports = mongodb;




