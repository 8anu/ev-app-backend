

// models/chargingPoint.js
const mongoose = require('mongoose');

const chargingPointSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    available: {
        type: Boolean,
        default: true
    },
    pricePerHour: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ChargingPoint', chargingPointSchema);
