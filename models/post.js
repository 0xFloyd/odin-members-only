var mongoose = require("mongoose");
var moment = require('moment');

var Schema = mongoose.Schema;

var PostSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true }, //reference to the associated book
    message: { type: String, required: true },
    date: { type: Date, default: Date.now } // We use default to set the default status for newly created bookinstances
});

PostSchema
    .virtual('date_formatted')
    .get(function () {
        return moment(this.date).format('MMMM Do, YYYY');
});


//Export model
module.exports = mongoose.model("Post", PostSchema);