const express = require('express');
const router = express.Router();
const {
    addNewTruck,
    updateTruck,
    deleteTruck,
    getSingleTruck,
    getAllTrucks,
    getTrucksBySize
} = require('../controllers/TrucksController')


// Sign Up Customer
router.post('/api/truck/addNew', addNewTruck)

// updating Truck Info
router.put('/api/truck/updateTruck/:id', updateTruck);

// Delete Truck
router.delete('/api/truck/deleteTruck/:id', deleteTruck)

// get Single Truck
router.get('/api/truck/getSingleTruck/:id', getSingleTruck)

// get All Truck
router.get('/api/truck/getAllTruck', getAllTrucks)

// get Trucks by Size
router.get('/api/truck/getTrucksBySize/:size', getTrucksBySize)


module.exports = router;