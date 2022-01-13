const Trucks = require('../models/TrucksScehma')


// adding ne truck
const addNewTruck = async (req, res) => {
    const {
        name,
        size,
        standeredRate,
        ratesPerKm,
        freeKm
    } = req.body;
    if (!name || !size || !standeredRate || !ratesPerKm || !freeKm) {
        return res.json({
            message: "Please fill All required credentials"
        });
    } else {
        const check = await Trucks.find({
            name: name
        })
        if (check.length > 0) {
            return res.json({
                message: '*** Truck Name Already taken ***'
            })
        } else {
            const newTruck = new Trucks({
                ...req.body
            })
            try {
                const addedTruck = await newTruck.save();

                res.status(201).json({
                    addedTruck,
                    message: '*** Truck SuccessFully Added ***'
                })
            } catch (error) {
                console.log("Error in addNewTruck and error is : ", error)
            }
        }
    }
}


// uodate Truck
const updateTruck = async (req, res) => {
    const {
        id
    } = req.params
    if (!id) {
        return res.status(201).json({
            message: '*** Truck Id is Required for Updation ****'
        })
    } else {
        const isExistTruck = await Trucks.findById(id)
        if (!isExistTruck) {
            return res.status(201).json({
                message: '*** Truck Id is Incorrect ****'
            })
        } else {
            try {
                const updatedTruck = await Trucks.findByIdAndUpdate(id, {
                    $set: req.body
                }, {
                    new: true
                })

                res.status(201).json({
                    updatedTruck,
                    message: '*** Truck Updated SuccessFully ***'
                })
            } catch (error) {
                console.log("Error in updateTruck and error is : ", error)
                return res.status(201).json({
                    message: '!!! Opps An Error Occured !!!',
                    error
                })
            }
        }
    }
}

// delete my account
const deleteTruck = async (req, res) => {
    const {
        id
    } = req.params;
    try {
        const deleteTruck = await Trucks.findByIdAndDelete(id);
        if (!deleteTruck) {
            return res.json({
                message: '*** Truck Not Found ****',
            });
        } else {
            return res.json({
                deleteTruck,
                message: '*** Truck SuccessFully Deleted ****',
            });
        }
    } catch (error) {
        console.log("Error in deleteTruck and error is : ", error)
    }
}

// get all Trucks
const getAllTrucks = async (req, res) => {
    try {
        const allTrucks = await Trucks.find();
        if (!allTrucks) {
            return res.json({
                message: '*** No Trucks  Found ****',
            });
        } else {
            return res.json({
                allTrucks,
                message: '*** Got Result ****',
            });
        }
    } catch (error) {
        console.log("Error in getAllTrucks and error is : ", error)
    }
}

// get Single Truck
const getSingleTruck = async (req, res) => {
    const {
        id
    } = req.params;
    try {
        const singleTruck = await Trucks.findById(id);
        if (!singleTruck) {
            return res.json({
                message: '*** No Truck Found ****',
            });
        } else {
            return res.json({
                singleTruck,
                message: '*** Got Result ****',
            });
        }
    } catch (error) {
        console.log("Error in LogInCustomer and error is : ", error)
    }
}

// get Trucks By Size
const getTrucksBySize = async (req, res) => {
    const {
        size
    } = req.params;
    try {
        const allTrucksBySize = await Trucks.find({
            size: size
        });
        if (allTrucksBySize.length < 1) {
            return res.json({
                message: '*** No Truck Found ****',
            });
        } else {
            return res.json({
                allTrucksBySize,
                message: '*** Got Result ****',
            });
        }
    } catch (error) {
        console.log("Error in LogInCustomer and error is : ", error)
    }
}

module.exports = {
    addNewTruck,
    getSingleTruck,
    updateTruck,
    deleteTruck,
    getAllTrucks,
    getTrucksBySize
}