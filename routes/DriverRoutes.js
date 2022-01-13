const express = require('express');
const router = express.Router();
const {
    addNewDriver,
    LogInDriver,
    sendMail,
    checkOtpCode,
    updateDriver,
    deleteAccount,
    widthDrawAmt,
    fetchAvailOrders,
    getDriversCount,
    getAllDrivers,
    getSingleDriver,
    updateDriverInfo,
    getDriverInfo,
    updateDriverPass
} = require('../controllers/DriverController')

// multer coding
const multer = require("multer")
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './driverImages')
    },
    filename: function (req, file, cb) {
        cb(null, 'image-' + Date.now() + file.originalname)
    }
})
const upload = multer({
    storage: storage,
});

const uplaodMultiple = upload.fields([{
        name: 'idCard',
        maxCount: 1
    },
    {
        name: 'idCardPic',
        maxCount: 1
    },
    {
        name: 'carInspectReport',
        maxCount: 1
    },
    {
        name: 'driverPic',
        maxCount: 1
    },
    {
        name: 'carLiscDescPic',
        maxCount: 1
    },
    {
        name: 'carInsureanceReport',
        maxCount: 1
    },
])


// Sign Up Driver
router.post('/api/driver/register', addNewDriver)


// Sign In Driver
router.post('/api/driver/signin', LogInDriver)

// updating Driver Docs
router.put('/api/driver/updateDriver/:id', updateDriver);

// updating Driver Variables only
router.put('/api/driver/updateInfo/:id', updateDriverInfo);


// Delete Driver Account
router.delete('/api/driver/deleteDriverCustomer/:id', deleteAccount)

// Check Email
router.post('/api/driver/checkEmailExists', sendMail)

// Check Otp Code
router.post('/api/driver/checkOtpCode/:email', checkOtpCode)

// withdraw amount
router.put('/api/driver/withDrawAmt/:id', widthDrawAmt)

// update driver password only
router.put('/api/driver/updatePass/:email', updateDriverPass)


// fetch online drivers
router.put('/api/driver/fetchOnlineOrders/:id', fetchAvailOrders)

// get online drivers count
router.get('/api/driver/getOnlineDriversCount', getDriversCount)

// get all  drivers
router.get('/api/driver/geAllDrivers', getAllDrivers)

// get singkle driver info
router.get('/api/driver/getSingle/:id', getDriverInfo)

// get single  drivers
router.get('/api/driver/geSingleDriver/:id', getSingleDriver)


module.exports = router;