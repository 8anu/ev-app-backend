const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
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

// Define ChargingStation Model
const chargingStationSchema = new mongoose.Schema({
    name: String,
    location: String,
    availablePorts: Number
});
const ChargingStation = mongoose.model('ChargingStation', chargingStationSchema);

// Root Route
app.get('/', (req, res) => {
    res.send('Server is running!');
});

// Example API Route
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!' });
});

// Get all charging stations
app.get('/api/charging-stations', async (req, res) => {
  try {
      const stations = await ChargingStation.find(); // Fetch all stations from MongoDB
      res.json(stations);
  } catch (error) {
      res.status(500).json({ message: 'Server Error' });
  }
});

// Get a specific station 
app.get('/api/charging-stations/:id', async (req, res) => {
  try {
      const station = await ChargingStation.findById(req.params.id);
      if (!station) return res.status(404).json({ message: 'Station not found' });
      res.json(station);
  } catch (error) {
      res.status(500).json({ message: 'Server Error' });
  }
});

// Add new charging station
app.post('/api/charging-stations', async (req, res) => {
  try {
      const { name, location, availablePorts } = req.body;
      const newStation = new ChargingStation({ name, location, availablePorts });
      await newStation.save();
      res.status(201).json(newStation);
  } catch (error) {
      res.status(500).json({ message: 'Error adding station' });
  }
});

// Update charging station
app.put('/api/charging-stations/:id', async (req, res) => {
  try {
      const updatedStation = await ChargingStation.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(updatedStation);
  } catch (error) {
      res.status(500).json({ message: 'Error updating station' });
  }
});

// Delete charging station
app.delete('/api/charging-stations/:id', async (req, res) => {
  try {
      await ChargingStation.findByIdAndDelete(req.params.id);
      res.json({ message: 'Station deleted' });
  } catch (error) {
      res.status(500).json({ message: 'Error deleting station' });
  }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
