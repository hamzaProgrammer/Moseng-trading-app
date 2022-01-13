const mongoose = require("mongoose");

const TrucksSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    size: {
        type: Number,
        required: true,
    },
    standeredRate: {
        type: Number,
        required: true,
    },
    ratesPerKm: {
        type: Number,
        required: true,
    },
    freeKm: {
        type: Number,
    },
}, {
    timestamps: true
});


const Trucks = mongoose.model('Trucks', TrucksSchema);

module.exports = Trucks