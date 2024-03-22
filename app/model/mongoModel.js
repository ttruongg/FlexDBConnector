const { Mongoose } = require('mongoose');

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
        object.id = _id.toString();
        return object;
    });

    const User = mongoose.model("users", schema);
    return User;
};

