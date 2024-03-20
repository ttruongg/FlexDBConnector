const mongoose = require('mongoose');

module.exports = mongoose => {
    var schema = mongoose.Schema(
        {
            // định nghĩa cấu trúc đối tượng trong mongodb
            name: String,
            age: Number,
            email: String
        },
        {timestamps: true}
    );

    schema.method("toJSON", function(){
        const {__v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
    });

    const user = mongoose.model("user", schema);
    return user;
};

