const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB Connection Error:', err));

// User Model (for authentication)
const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String
});
const User = mongoose.model('User', UserSchema);

// ChargingStation Model
const chargingStationSchema = new mongoose.Schema({
    name: String,
    location: String,
    availablePorts: Number
});
const ChargingStation = mongoose.model('ChargingStation', chargingStationSchema);

// Function to generate JWT token
const generateToken = (user) => {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// User Registration
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user' });
    }
});

// User Login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user);
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in' });
    }
});

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'Access denied' });
    }

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token' });
    }
};

// Root Route
app.get('/', (req, res) => {
    res.send('Server is running!');
});

// Example API Route
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!' });
});

// Get all charging stations (Protected Route)
app.get('/api/charging-stations', verifyToken, async (req, res) => {
  try {
      const stations = await ChargingStation.find();
      res.json(stations);
  } catch (error) {
      res.status(500).json({ message: 'Server Error' });
  }
});

// Get a specific station (Protected Route)
app.get('/api/charging-stations/:id', verifyToken, async (req, res) => {
  try {
      const station = await ChargingStation.findById(req.params.id);
      if (!station) return res.status(404).json({ message: 'Station not found' });
      res.json(station);
  } catch (error) {
      res.status(500).json({ message: 'Server Error' });
  }
});

// Add new charging station (Protected Route)
app.post('/api/charging-stations', verifyToken, async (req, res) => {
  try {
      const { name, location, availablePorts } = req.body;
      const newStation = new ChargingStation({ name, location, availablePorts });
      await newStation.save();
      res.status(201).json(newStation);
  } catch (error) {
      res.status(500).json({ message: 'Error adding station' });
  }
});

// Update charging station (Protected Route)
app.put('/api/charging-stations/:id', verifyToken, async (req, res) => {
  try {
      const updatedStation = await ChargingStation.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(updatedStation);
  } catch (error) {
      res.status(500).json({ message: 'Error updating station' });
  }
});

// Delete charging station (Protected Route)
app.delete('/api/charging-stations/:id', verifyToken, async (req, res) => {
  try {
      await ChargingStation.findByIdAndDelete(req.params.id);
      res.json({ message: 'Station deleted' });
  } catch (error) {
      res.status(500).json({ message: 'Error deleting station' });
  }
});

// Start the Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
