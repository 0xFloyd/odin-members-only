var mongoose = require("mongoose");
var moment = require('moment');
var Schema = mongoose.Schema;

var MessageSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true }, //reference to the associated book
    message: { type: String, required: true },
    date: { type: Date, default: Date.now } // We use default to set the default status for newly created bookinstances
});

MessageSchema
    .virtual('date_formatted')
    .get(function () {
        return moment(this.date).format('MMMM Do, YYYY');
});
    // each val in bookinstance_list
    // span  (Due: #{val.due_back_formatted} )       so for this, ill do val.date_formatted to show the date of the user message
    // bookinstance_list.pug

//Export model
module.exports = mongoose.model("Message", MessageSchema);

/*

 <!--

            <% if (message_list) {%>
                <% for message in message_list {%>
                    <p><% message.message %></p>
                    <p><% message.user %></p>
                <%}%>
            <% } else {%>
                <p>No messages found</p>
            <%}%>
            -->

*/