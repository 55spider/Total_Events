const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const session = require('express-session');
const path = require('path');
const multer  = require('multer');

// Multer setup for file uploads
const storage = multer.memoryStorage();

//const upload = multer({ storage: storage });
const upload = multer({ storage: multer.memoryStorage() });

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
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    }
    res.redirect('/login.html');
}

 // Validation middleware for signup route
 const validateSignup = [
    body('name').notEmpty().withMessage('Your name is required'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

// Signup Route
app.post('/signup', validateSignup, async (req, res) => {
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

      // Basic input validation
      if (!email || !password) {
        return res.status(400).send({ error: 'Email and password are required' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).send({ error: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).send({ error: 'Invalid email or password' });
        }

        // Create a session for the user
        req.session.userId = user._id;

        // On successful login, redirect to the index page
        res.redirect('/home.html');
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).send({ error: 'Internal server error' });
    }
});

// Route to serve login page if not authenticated
app.get('/', (req, res) => {
    // Check if user is logged in (based on session variable)
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



// Route for event

app.get('/event', async (req, res) => {
    try {
        const events = await Event.find();
        res.status(200).json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ success: false, message: 'Error fetching events', error });
    }
});




// POST route for creating an event
app.post('/event', upload.single('eventImage'), async (req, res) => {
    const { eventName, eventLocation, eventDate, eventDescription } = req.body;
    const eventImage = req.file;
  
    if (!eventName || !eventLocation || !eventDescription) {
      return res.status(400).json({ message: 'All event fields are required' });
    }
  
    const eventData = {
      name: eventName,
      location: eventLocation,
      date: new Date(eventDate),
      description: eventDescription,
    };
  
    if (eventImage) {
      eventData.image = {
        data: eventImage.buffer,
        contentType: eventImage.mimetype,
      };
    }
  
    try {
      const event = new Event(eventData);
      event.save();
      res.status(201).json({ message: 'Event created successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error creating event', error });
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


  app.post('/venue', upload.single('image'), async (req, res) => {
    const { name, location, description, capacity } = req.body;
    const { buffer, mimetype } = req.file;
    const image = req.file;

    console.log("Received payload :", { name, location, capacity, image });

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
        console.error(error);
        res.status(500).json({ message: 'Error creating venue', error: error.message });
    }
});

//tickets
app.get('/tickets', async (req, res) => {
    try {
        const tickets = await Ticket.find(); // Assuming Ticket model has a find method
        res.status(200).json(tickets);
    } catch (error) {
        console.error('Error fetching tickets:', error.message);
        res.status(500).json({ message: "Server Error" });
    }
});

const ticketPrices = {
    VIP: 1000,
    General: 500,
    Student: 100
};
app.post('/tickets', async (req, res) => {
    try {
        const { name, email, quantity, ticketType } = req.body;

        console.log('Received payload:', req.body);

        if (!name || !email || !quantity || !ticketType) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const ticketPrices = {
            VIP: 1000,
            General: 500,
            Student: 100
        };

        if (!ticketPrices[ticketType]) {
            return res.status(400).json({ message: "Invalid ticket type" });
        }

        if (isNaN(quantity) || quantity <= 0) {
            return res.status(400).json({ message: "Invalid quantity" });
        }

        const ticketData = {
            name,
            email,
            quantity,
            ticketType,
            price: ticketPrices[ticketType]
        };

        const ticket = await Ticket.create(ticketData);
        res.status(201).json(ticket);
    } catch (error) {
        console.error('Error booking ticket:', error);
        res.status(500).json({ message: "Server Error" });
    }
});


app.post('/organiser', async (req, res) => {
    try {
        const { organiserName, organiserEmail, organiserPhone } = req.body;

        console.log('Received payload:', req.body);

        if (!organiserName || !organiserEmail || !organiserPhone) {
            return res.status(400).json({ message: 'All organiser fields are required' });
        }

        const newOrganiser = new Organiser({ organiserName, organiserEmail, organiserPhone });
        newOrganiser.save();
        res.status(201).json({ message: 'Organiser created successfully' });
    } catch (error) {
        console.error('Error saving organiser:', error);
        res.status(500).json({ message: 'Error creating organiser' });
    }
});

app.post('/logout', (req, res) => {
    // Destroy the user session
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        // Handle session destruction error (optional)
        return res.status(500).send({ error: 'Internal server error' });
      }
  
      // Redirect to login page with success message
      const message = 'You have been successfully logged out.'; // Define your message
      res.redirect(`/login.html?message=${encodeURIComponent(message)}`);
    });
  });
  
 

mongoose.connect('mongodb+srv://admin:UWN4O8iFRgF5izhH@totalevents.00yxzdo.mongodb.net/totalevent?retryWrites=true&w=majority')
    .then(() => {
        app.listen(port, () => {
            console.log('Server is running on port 3000');
        });
        console.log('Connected to database');
    }).catch((error) => {
        console.log(error);
    });
 