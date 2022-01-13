const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    price: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    desc: {
        type: String,
        required: true,
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'customers',
    },
    truckId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'trucks',
    },
    pickUpLoc: {
        type: {
            type: String,
            default: "Point",
        },
        coordinates: {
            type: [Number], //the type is an array of numbers
            //index: "2dsphere"
        }
    },
    dropLoc: {
        type: {
            type: String,
            default: "Point",
        },
        coordinates: {
            type: [Number], //the type is an array of numbers
            //index: "2dsphere"
        }
    },
    reviewOfOrder: {
        type: Number,
        default: '0'
    },
    noOfCustInArea: {
        type: Number,
        default: '0'
    },
    noOfTrucksInArea: {
        type: Number,
        default: '0'
    },
    smf: { // seaching tax
        type: Number,
        default: '50'
    },
    avgSpeed: { // provided from google api. this is speed of driver
        type: Number,
        default: '0'
    },
    appoxSpeed: { // provided from google api
        type: Number,
        default: '0'
    },
    tmf: { // traffic tax
        type: Number,
        default: '50'
    },
    driverGotAmt: {
        type: Number,
        default: '0'
    },
    adminAmt: {
        type: Number,
        default: '0'
    },
    totalDist: {
        type: Number,
        default: '0'
    },
    finalDist: {
        type: Number,
        default: '0'
    },
    finalAmt: {
        type: Number,
        default: '0'
    },
    tipAmt: {
        type: Number,
        default: '0'
    },
    orderStatus: {
        type: Boolean,
        default: 'false'
    },
    finalDriver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'drivers',
    },
    orderConfByDrivers: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'drivers',
    },
    status: {
        type: String,
        default: ''
    },
    paymentStatus: {
        type: Boolean,
        default: 'false'
    },
    ordercancelledByDriver: {
        type: Boolean,
        default: 'false'
    },
    ordercancelledByCustomer: {
        type: Boolean,
        default: 'false'
    },
    orderFinalByDriver: {
        type: Boolean,
        default: 'false'
    },
    orderFinalByCustomer: {
        type: Boolean,
        default: 'false'
    }
}, {
    timestamps: true
});


const TrucksOrders = mongoose.model('TrucksOrders', OrderSchema);

module.exports = TrucksOrders