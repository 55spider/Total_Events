const mongoose = require('mongoose');


const ticketSchema = mongoose.Schema(
    {


      name:{
        type: String,
        required: true
      },

      email:{
        type:String,
        required: true,
        unique: true
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

        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User', // Reference to the User model
          required: true
      }

    }
);


const Ticket = mongoose.model("Ticket", ticketSchema);

module.exports = Ticket;

