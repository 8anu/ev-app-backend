

// routes/chargingPoints.js
const express = require('express');
const ChargingPoint = require('../models/ChargingPoint'); // Import Model
const router = express.Router();

// 🟢 Create a new charging point
router.post('/', async (req, res) => {
    try {
        const newPoint = new ChargingPoint(req.body);
        await newPoint.save();
        res.status(201).json(newPoint);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 🔵 Get all charging points
router.get('/', async (req, res) => {
    try {
        const points = await ChargingPoint.find();
        res.json(points);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 🟣 Get a single charging point by ID
router.get('/:id', async (req, res) => {
    try {
        const point = await ChargingPoint.findById(req.params.id);
        if (!point) return res.status(404).json({ message: 'Charging point not found' });
        res.json(point);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 🟠 Update a charging point
router.put('/:id', async (req, res) => {
    try {
        const updatedPoint = await ChargingPoint.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedPoint);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 🔴 Delete a charging point
router.delete('/:id', async (req, res) => {
    try {
        await ChargingPoint.findByIdAndDelete(req.params.id);
        res.json({ message: 'Charging point deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
