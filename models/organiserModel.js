const mongoose = require('mongoose');

const organiserSchema = mongoose.Schema(
    {

        name:{
            type:String,
            required:[true, "Your name is required"]
        },

        email:{
            type:String,
            required:[true, "Please input your email"]
        },

        phone:{
            type:Number,
            required:[true, "Please enter your contact details"]
        }



    }
);


const Organiser = mongoose.model("Organiser", organiserSchema);

module.exports = Organiser;