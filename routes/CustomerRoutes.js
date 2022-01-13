const express = require('express');
const router = express.Router();
const {
    addNewCustomer,
    LogInCustomer,
    sendMail,
    checkOtpCode,
    updateCustomer,
    deleteAccount,
    getAllCustomersCount,
    getAllCustomers,
    getSingleCustomer,
    updateCustomerPass
} = require('../controllers/CustomerController')


// Sign Up Customer
router.post('/api/cutomer/register', addNewCustomer)

// Sign In User
router.post('/api/cutomer/signin', LogInCustomer)

// updating Customer Info
router.put('/api/cutomer/updateCustomer/:id', updateCustomer);

// Delete user
router.delete('/api/cutomer/deleteCustomer/:id', deleteAccount)

// Check Email
router.post('/api/cutomer/checkEmailExists', sendMail)

// update customer password only
router.put('/api/cutomer/updatePass/:email', updateCustomerPass)

// Check Otp Code
router.post('/api/cutomer/checkOtpCode/:email', checkOtpCode)

// get All customers Count
router.get('/api/cutomer/getAll/count', getAllCustomersCount)

// get All customers
router.get('/api/cutomer/getAll', getAllCustomers)

// get Single customer
router.get('/api/cutomer/getSingle/:id', getSingleCustomer)

module.exports = router;