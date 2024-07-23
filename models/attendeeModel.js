const mongoose = require('mongoose');

const attendeeSchema = mongoose.Schema(
    {

        name:{
            type:String,
            required:[true, "Your name is required"]
        },

        email:{
            type:String,
            required:[true, "Please input your email"]
        },

        contact:{
            type:Number,
            required:[true, "Please enter your contact details"]
        }


    }
);



const Attendee = mongoose.model("Attendee", attendeeSchema);

module.exports = Attendee;