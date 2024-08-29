const mongoose = require('mongoose');

const eventSchema = mongoose.Schema(
    {

        name:{
            type:String,
            required:[true, "The event name is required"]
        },

        location:{
            type:String,
            required:[true, "The event location is required"]
        },

        image: {
            data: {
                type: Buffer,
                required: [true]
            },
            contentType: {
                type: String,
                required: [true]
            }
        },
        description:{
            type:String,
            required:[true, "The event description is required"]
        },
        
               date:{
            type:Date,
            required:[true, "The event date is required"]
        }


    }
);


const Event = mongoose.model("Event", eventSchema);

module.exports = Event;