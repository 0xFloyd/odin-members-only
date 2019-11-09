var mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    //firstname: { type: String, required: true }, 
    //lastname: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    member: { type: Boolean, default: false  } // We use default to set the default status for newly created bookinstances
});

UserSchema.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};



//Export model
module.exports = mongoose.model("User", UserSchema);