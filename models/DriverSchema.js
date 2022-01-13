const mongoose = require("mongoose");

const DriverSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    language: {
        type: String,
    },
    refCode: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
    phoneNo: {
        type: Number,
        required: true,
    },
    optpCode: { // code for user reset password
        type: Number,
        default: '0'
    },
    tokenSentTime: { // code for user reset password
        type: Date,
    },
    widthDrawlDate: { // code for user reset password
        type: Date,
        default: null
    },
    acctStatus: {
        type: Boolean,
        default: 'false'
    },
    paymentTotal: {
        type: Number,
        default: '0'
    },
    rating: {
        type: Number,
        default: '0'
    },
    noOfCustRatings: {
        type: Number,
        default: '0'
    },
    noOfOrders: {
        type: Number,
        default: '0'
    },
    noOfOrdersCancelled: {
        type: Number,
        default: '0'
    },
    noOfOrdersCompleted: {
        type: Number,
        default: '0'
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
    },
    // carDetails: [{
    //     _id: false,
    menufacturer: {
        type: String,
        default: ''
    },
    year: {
        type: Date,
        default: null
    },
    regNo: {
        type: String,
        default: ''
    },
    color: {
        type: String,
        default: ''
    },
    liscnceNo: {
        type: String,
        default: ''
    },
    vinNo: {
        type: String,
        default: ''
    },
    //}],
    // legalDetails: [{
    //     _id: false,
    idCard: { // this is pic
        type: String,
        default: ''
    },
    drivLisc: {
        type: String,
        default: ''
    },
    regNo: {
        type: String,
        default: ''
    },
    liscExpDate: { // we will apply check on this if it is geaeter than current date or not
        type: Date,
        default: null
    },
    //}],
    // legalDocuments: [{
    //     _id: false,
    idCardPic: {
        type: String,
        default: ''
    },
    carInspectReport: {
        type: String,
        default: ''
    },
    driverPic: {
        type: String,
        default: ''
    },
    carLiscDescPic: {
        type: String,
        default: ''
    },
    carInsureanceReport: {
        type: String,
        default: ''
    },
    activeStatus: {
        type: Boolean,
        default: 'false'
    },
    availOrders: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'trucksorders'
    },
    truckSelected: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'trucks'
    },
    confirmedOrders: { // this contains all order which are confimred by cutomers
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'trucksorders'
    }
    //}],

}, {
    timestamps: true
});


const Drivers = mongoose.model('Drivers', DriverSchema);

module.exports = Drivers