const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'The event name is required']
  },

  location: {
    type: String,
    required: [true, 'The event location is required']
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

  description: {
    type: String,
    required: [true, 'The event description is required']
  },

  date: {
    type: Date,
    required: [true, 'The event date is required']
  },

  organiserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organiser', // Reference to the Organiser model
    required: true
  }
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;