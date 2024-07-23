const mongoose = require('mongoose');

const venueSchema = mongoose.Schema(
    {

        name:{
            type:String,
            required:[true, "Your name is required"]
        },

        location:{
            type:String,
            required:[true, "Venue location is required"]
        },

        image: {
            data: {
                type: Buffer,
                required: [true, "The venue image data is required"]
            },
            contentType: {
                type: String,
                required: [true, "The venue image content type is required"]
            }
        },


        capacity:{
            type:String,
            required:[true, "Venue capacity is required"]
        }

    }
);


const Venue = mongoose.model("Venue", venueSchema);

module.exports = Venue;