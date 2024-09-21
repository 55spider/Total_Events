const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();  // Load environment variables from .env file
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const session = require('express-session');
const path = require('path');
const multer = require('multer');

const User = require('./models/userModel');
const Venue = require('./models/venueModel');
const Ticket = require('./models/ticketModel');
const Organiser = require('./models/organiserModel');
const Event = require('./models/eventModel');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configure express-session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } 
}));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
  console.log('Session:', req.session);
  console.log('Session userId:', req.session.userId);

  if (req.session && req.session.userId) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
}

// Signup Route
app.post('/signup', async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    // Check for existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).send({ error: 'Email already exists' });
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).send({ message: 'User created successfully' });
  } catch (err) {
    console.error('Error adding user:', err);
    res.status(500).send({ error: 'Internal server error' });
  }
});

// Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    console.log('User found:', user); // Log user object
    if (!user) {
      return res.status(401).send({ error: 'Invalid email' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch); // Log result of password comparison
    if (!isMatch) {
      return res.status(401).send({ error: 'Invalid password' });
    }
    req.session.userId = user._id;
    res.status(200).send({ message: 'Logged in successfully' });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).send({ error: 'Internal server error' });
  }
});


// Route to serve login page if not authenticated
app.get('/', (req, res) => {
  if (req.session.userId) {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
  } else {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
  }
});

// Route to serve home page, only accessible if authenticated
app.get('/home', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// Event routes
app.get('/event', async (req, res) => {
  try {
    const events = await Event.find().exec();
    const eventWithImage = events.map(event => {
      let eventImage = null;
      if (event.image && event.image.data) {
        eventImage = `data:${event.image.contentType};base64,${event.image.data.toString('base64')}`;
      }
      return { ...event.toObject(), image: eventImage };
    });
    res.status(200).json(eventWithImage);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ success: false, message: 'Error fetching events', error });
  }
});

app.post('/event', multer().single('eventImage'), async (req, res) => {
  const { eventName, eventDate, eventLocation, eventDescription, organiserId } = req.body;
  const image = req.file;

  console.log('Received payload:', req.body);
  console.log('Received file:', req.file);

  // Validate required fields
  if (!eventName || !eventLocation || !image || !eventDate || !eventDescription || !organiserId) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  // Validate eventDate format
  const parsedDate = new Date(eventDate);
  if (isNaN(parsedDate)) {
    return res.status(400).json({ message: 'Invalid event date' });
  }

  const eventData = {
    name: eventName, // Match your Event schema field names
    location: eventLocation,
    image: {
      data: image.buffer,
      contentType: image.mimetype,
    },
    description: eventDescription,
    date: parsedDate, // Ensure this is a Date object
    organiserId
  };

  try {
    const event = new Event(eventData);
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Error creating event', error: error.message });
  }
});

// Route to get all venues
app.get('/venue', async (req, res) => {
  try {
    const venues = await Venue.find().exec();
    const venuesWithImageUrls = venues.map((venue) => {
      let imageDataUrl = null;
      if (venue.image && venue.image.data) {
        imageDataUrl = `data:${venue.image.contentType};base64,${venue.image.data.toString('base64')}`;
      }
      return { ...venue.toObject(), image: imageDataUrl };
    });
    res.json(venuesWithImageUrls);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching venues', error });
  }
});

app.get('/booked-venues', async (req, res) => {
  try {
    const { date } = req.query;
    console.log('Received date:', date);

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    const bookedVenues = await Event.find({ date }).distinct('location');
    res.json(bookedVenues);
  } catch (error) {
    console.error('Error fetching booked venues:', error);
    res.status(500).json({ error: 'Failed to fetch booked venues' });
  }
});

// Route to create a venue
app.post('/venue', multer().single('image'), async (req, res) => {
  const { name, location, capacity } = req.body;
  const image = req.file;

  console.log('Received payload:', req.body);
  console.log('Received file:', req.file);

  if (!name || !location || !image || !capacity) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  const venueData = {
    name,
    location,
    image: {
      data: image.buffer,
      contentType: image.mimetype,
    },
    capacity
  };

  try {
    const venue = new Venue(venueData);
    await venue.save();
    res.status(201).json({ message: 'Venue created successfully' });
  } catch (error) {
    console.error('Error creating venue:', error);
    res.status(500).json({ message: 'Error creating venue', error: error.message });
  }
});

// Tickets routes
app.get('/tickets', isAuthenticated, async (req, res) => {
  try {
    const tickets = await Ticket.find({ userId: req.session.userId });
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

app.get('/tickets/:ticketId', isAuthenticated, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (ticket.userId.toString() !== req.session.userId) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    res.json(ticket);
  } catch (error) {
    console.error(`Error fetching ticket ${req.params.ticketId}:`, error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/tickets', isAuthenticated, async (req, res) => {
  try {
    const { name, email, quantity, ticketType } = req.body;

    console.log('Received payload:', req.body);

    if (!name || !email || !quantity || !ticketType) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const ticketPrices = {
      VIP: 1000,
      General: 500,
      Student: 100
    };

    if (!ticketPrices[ticketType]) {
      return res.status(400).json({ message: 'Invalid ticket type' });
    }

    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }

    const ticketData = {
      name,
      email,
      quantity,
      ticketType,
      price: ticketPrices[ticketType],
      userId: req.session.userId
    };

    const ticket = await Ticket.create(ticketData);
    console.log('Ticket created:', ticket);
    res.status(201).json(ticket);
  } catch (error) {
    console.error('Error booking ticket:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Route to create an organiser
app.post('/organiser', async (req, res) => {
  try {
    const { organiserName, organiserEmail, organiserPhone } = req.body;
  
    console.log('Received payload:', req.body);
  
    // Validate the input
    if (!organiserName || !organiserEmail || !organiserPhone) {
      return res.status(400).json({ message: 'All organiser fields are required' });
    }
  
    // Create a new organiser instance
    const organiserInstance = new Organiser({ // Use the Organiser model here
      name: organiserName,
      email: organiserEmail,
      phone: organiserPhone
    });
  
    // Save the organiser to the database
    await organiserInstance.save();
  
    // Send a success response
    res.status(201).json(organiserInstance); // Use organiserInstance
    console.log('Organiser created successfully');
  } catch (error) {
    console.error('Error saving organiser:', error);
    res.status(500).json({ message: 'Error creating organiser' });
  }
});

  

// Logout Route
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).send({ error: 'Internal server error' });
    }

    res.redirect('/login.html?message=' + encodeURIComponent('You have been successfully logged out.'));
  });
});

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
    console.log('Connected to database');
  })
  .catch((error) => {
    console.error('Database connection error:', error);
  });
