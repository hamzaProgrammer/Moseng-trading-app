const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    totalAmt: {
        type: Number,
        default: '0'
    },
}, {
    timestamps: true
});


const admin = mongoose.model('Admin', adminSchema);

module.exports = admin