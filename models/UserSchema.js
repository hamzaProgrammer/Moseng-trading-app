const mongoose = require("mongoose");

const CustSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    phoneNo: {
        type: String,
        required: true,
    },
    paymentTotal: {
        type: Number,
        default: '0'
    },
    optpCode: { // code for user reset password
        type: Number,
    },
    tokenSentTime: { // code for user reset password
        type: Date,
    },
    curntLoc: { // whenever user signs in his current location is setted in his acc.
        type: {
            type: String,
            default: "Point",
        },
        coordinates: {
            type: [Number], //the type is an array of numbers
            //index: "2dsphere"
        }
    }

}, {
    timestamps: true
});


const Customers = mongoose.model('Customers', CustSchema);

module.exports = Customers