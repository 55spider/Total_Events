const mongoose = require('mongoose');


const ticketSchema = mongoose.Schema(
    {


      name:{
        type: String,
        required: true
      },

      email:{
        type:String,
        required: true
        },
        
        ticketType: {
        type: String,
        enum: ['VIP', 'General', 'Student'],
        required: true
    },
    
    price: {
        type: Number,
        required: true
    },

          quantity: {
            type: Number,
            required: true
        },

        

    }
);


const Ticket = mongoose.model("Ticket", ticketSchema);

module.exports = Ticket;

