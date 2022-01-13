const express = require('express');
const router = express.Router();
const {
    addNewOrder,
    updateOrder,
    // deleteAccount,
    fetchNoOfCust,
    calcAmt,
    calcAdminAmt,
    deductAmtfromCust,
    addDriverAmt,
    addAmtToAdmin,
    orderCancelledByCust,
    orderCancelledByDriver,
    makeStripePayment,
    getOrdersCount,
    getAllOrders,
    getActiveOrders,
    getCancelledOrders,
    getSingleOrder,
    getCustomerOrderInfo,
    getAllOrdersByCust
} = require('../controllers/OrderController')


// adding new order
router.post('/api/order/addNew', addNewOrder)

// fetch online drivers
router.put('/api/order/fetchOnlineCustomers/:id', fetchNoOfCust)

// updating Order Info
router.put('/api/order/updateOrder/:id', updateOrder);

// calculating total amount i.e smf + tmf and adding amount to.
router.put('/api/order/calcOrderAmt/:id/:adminId', calcAmt);

// adding amount to admin account
router.put('/api/order/addToAdminAcc/:id', addAmtToAdmin);

// adding amount to driver
router.put('/api/order/addToDriverAcc/:id', addDriverAmt);

// deducting order amount from customer account
router.put('/api/order/deductAmtfromCust/:id', deductAmtfromCust);

// calculting admin amount and adding to admin account
router.put('/api/order/calcAdminAmt/:id', calcAdminAmt);

// order cancelled by cutomer
router.put('/api/order/ordrCancelledByCust/:id', orderCancelledByCust);

// order cancelled by driver
router.put('/api/order/ordrCancelledBDriver/:id/:adminId', orderCancelledByDriver);

// make payment with stripe
router.put('/api/order/paymentWithStripe/:id', makeStripePayment);


// get orders count Active only
router.get('/api/order/ordersCount', getOrdersCount);

// get all orders
router.get('/api/order/ordersGetAll', getAllOrders);

// get all active orders
router.get('/api/order/getAllActive', getActiveOrders);

// get all cancelled orders
router.get('/api/order/getAllCancelled', getCancelledOrders);

// get single order
router.get('/api/order/getSingle/:id', getSingleOrder);

// get all orders by a customer
router.get('/api/order/getAllByCust/:id', getAllOrdersByCust);

// getting order info
router.get('/api/order/getOrderInfo/:id', getCustomerOrderInfo);

// // Delete user
// router.delete('/api/cutomer/deleteCustomer/:id', deleteAccount)



module.exports = router;