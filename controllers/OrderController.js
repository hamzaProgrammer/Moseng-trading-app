const Orders = require('../models/OrderSchema')
const Drivers = require('../models/DriverSchema')
const Trucks = require('../models/TrucksScehma')
const Admin = require('../models/AdminSchema')
const Customers = require('../models/UserSchema')
const {
    fetchAvailOrders
} = require("./DriverController")
const {
    geocoder
} = require('../models/GeoCoder')
const uuid = require("uuid"); // avoid double payment charge from customer for same order


// adding new order
const addNewOrder = async (req, res) => {
    const {
        title,
        price,
        date,
        desc,
        postedBy,
        pickUpLoc,
        dropLoc,
        truckId
    } = req.body;
    console.log(req.body)
    if (!title || !price || !date || !desc || !postedBy || !pickUpLoc || !dropLoc || !truckId) {
        return res.json({
            message: "Please fill All required credentials"
        });
    } else {
        let loc, loc1

        // getting sender location
        loc = await geocoder.geocode(req.body.pickUpLoc);
        req.body.pickUpLoc = {
            type: "Point",
            coordinates: [loc[0].latitude, loc[0].longitude],
        };

        // getting end point location
        loc1 = await geocoder.geocode(req.body.dropLoc);
        req.body.dropLoc = {
            type: "Point",
            coordinates: [loc1[0].latitude, loc1[0].longitude],
        };

        // calculating difernce between locations
        const distabceBtTwoPoints = calcCrow(loc[0].longitude, loc[0].latitude, loc1[0].longitude, loc1[0].latitude);
        req.body.totalDist = distabceBtTwoPoints;


        const newOrder = new Orders({
            ...req.body
        })
        try {
            const addedOrder = await newOrder.save();
            var id = addedOrder._id.toString()
            console.log("Ordr Saved")
            let custFetched = await fetchNoOfCust(id);
            if (custFetched !== "Done") {
                return res.status(201).json({
                    message: '!!! error Occured while fetching no of customers in area !!!'
                })
            }

            let driversFetched = await fetchAvailOrders(id);
            if (driversFetched !== "Done") {
                return res.status(201).json({
                    message: '!!! error Occured while fetching no of Drivers in area !!!'
                })
            }

            res.status(201).json({
                addedOrder,
                message: '*** Order SuccessFully Posted ***'
            })
        } catch (error) {
            console.log("Error in addNewOrder and error is : ", error)
        }
    }
}


// calculate price
const calcAmt = async (id) => {
    try {
        const gotOrder = await Orders.findById(id);
        if (!gotOrder) {
            return res.json({
                message: '*** Order Does Not Exists ****',
            });
        } else {
            const gotTruck = await Trucks.findById(gotOrder.truckId);
            let freeDist = gotTruck.freeKm;
            let standerRate = gotTruck.standeredRate
            let ratePerKm = gotTruck.ratesPerKm


            // calculating TMF
            if (!gotOrder.avgSpeed || !gotOrder.appoxSpeed || !gotOrder.finalDist || !gotOrder.totalDist || !gotOrder.truckId) {
                let totalDist = gotOrder.totalDist - freeDist;
                let trafficCond = gotOrder.avgSpeed / gotOrder.appoxSpeed;
                let tmf = (50 * trafficCond) / 100;
                if (tmf >= 1) {
                    gotOrder.tmf = tmf;
                } else {
                    gotOrder.tmf = 1;
                }
                gotOrder.finalDist = totalDist;
            }

            // calculating SMF
            if (!gotOrder.noOfCustInArea || !gotOrder.noOfTrucksInArea) {
                //let preSmf = gotOrder.noOfCustInArea / gotOrder.noOfTrucksInArea;
                let preSmf = gotOrder.noOfCustInArea / 1;
                let smf = (50 * preSmf) / 100;
                if (smf >= 1) {
                    gotOrder.smf = smf;
                } else {
                    gotOrder.smf = 1;
                }
            }

            // calculating Order Amount
            let orderAmount = (standerRate + (gotOrder.finalDist * ratePerKm)) * gotOrder.tmf * gotOrder.smf;
            gotOrder.finalAmt = orderAmount;

            await Orders.findByIdAndUpdate(id, {
                $set: gotOrder
            }, {
                new: true
            })
            return "Done"
            //res.status(201).json({updatedOrder , message: '*** Order Pricing  Updated SuccessFully ***'})
        }
    } catch (error) {
        console.log("Error in calcAmt and error is : ", error)
    }
}

// setting admin and driver amounts
const calcAdminAmt = async (id) => {
    //const {id} = req.params;
    try {
        const gotOrder = await Orders.findById(id);
        if (!gotOrder) {
            return res.json({
                message: '*** Order Does Not Exists ****',
            });
        } else {
            // calculating admin amount
            let adminAmt = (gotOrder.finalAmt * 20) / 100;
            let adminService = (gotOrder.finalAmt * 4) / 100;
            let totalAdminAmt = adminAmt + adminService;

            gotOrder.adminAmt = totalAdminAmt;
            let driAmt = gotOrder.finalAmt - totalAdminAmt;
            gotOrder.driverGotAmt = driAmt; // this will be all driver's money
            // updating admin amount

            // upadting order
            const updatedOrder = await Orders.findByIdAndUpdate(id, {
                $set: {
                    ...gotOrder
                }
            }, {
                new: true
            })
            return "Done"
            //res.status(201).json({updatedOrder , message: '*** Order payment calculated SuccessFully ***'})
        }
    } catch (error) {
        console.log("Error in calcAdminAmt and error is : ", error)
    }
}

// calculate and adding Admin Ammount
const addAmtToAdmin = async (id) => {
    try {
        const gotOrder = await Orders.findById(id);
        if (!gotOrder) {
            return res.json({
                message: '*** Order Does Not Exists ****',
            });
        } else {
            const gotAdmin = await Admin.findOne({
                username: "admin"
            });

            gotAdmin.totalAmt += gotOrder.adminAmt;
            await Admin.findOneAndUpdate({
                username: "admin"
            }, {
                $set: {
                    ...gotAdmin
                }
            }, {
                new: true
            })

            // upadting order
            const updatedOrder = await Orders.findByIdAndUpdate(id, {
                $set: {
                    ...gotOrder
                }
            }, {
                new: true
            })
            return "Done"
            //res.status(201).json({updatedOrder , message: '*** Order payment calculated SuccessFully ***'})
        }
    } catch (error) {
        console.log("Error in calcAdminAmt and error is : ", error)
    }
}

// calculate and adding to Driver Ammount
const addDriverAmt = async (id) => {
    try {
        const gotOrder = await Orders.findById(id);
        if (!gotOrder) {
            return res.json({
                message: '*** Order Does Not Exists ****',
            });
        } else {
            try {
                if (gotOrder.finalDriver) {
                    const gotDriver = await Drivers.findById(gotOrder.finalDriver)
                    console.log("Driver Id : ", gotOrder.finalDriver, "Driver : ", gotDriver)
                    // calculating driver amount
                    gotDriver.paymentTotal += gotOrder.driverGotAmt
                    let driverAmount = gotDriver.paymentTotal
                    // adding amount to driver account
                    await Drivers.findByIdAndUpdate(gotOrder.finalDriver, {
                        $set: {
                            ...gotDriver
                        }
                    }, {
                        new: true
                    })


                    // upadting order
                    const updatedOrder = await Orders.findByIdAndUpdate(id, {
                        $set: {
                            ...gotOrder,
                            driverGotAmt: driverAmount
                        }
                    }, {
                        new: true
                    })
                    return "Done"
                    //res.status(201).json({updatedOrder , message: '*** Order payment calculated SuccessFully ***'})
                }
            } catch (e) {
                console.log("Error in addDriverAmt and error is : ", e)
            }
        }
    } catch (error) {
        console.log("Error in calcAdminAmt and error is : ", error)
    }
}

// calculate Admin and  Driver Ammounts
const deductAmtfromCust = async (id) => {
    try {
        const gotOrder = await Orders.findById(id);
        if (!gotOrder) {
            return res.json({
                message: '*** Order Does Not Exists ****',
            });
        } else {
            if (gotOrder.finalAmt == 0) {
                return res.status(201).json({
                    message: '*** Order Payment has not been calculated yet ***'
                })
            } else {
                const gotCustomer = await Customers.findById(gotOrder.postedBy);
                gotCustomer.paymentTotal -= gotOrder.finalAmt;

                // upadting order
                const updatedCustomer = await Customers.findByIdAndUpdate(gotOrder.postedBy, {
                    $set: {
                        ...gotCustomer
                    }
                }, {
                    new: true
                })
                return "Done"
                //res.status(201).json({updatedCustomer , message: '*** Order Payment has been deducted from cutomer account SuccessFully ***'})
            }
        }
    } catch (error) {
        console.log("Error in deductAmtfromCust and error is : ", error)
    }
}

// get all active cutomers in loc bewteen
const fetchNoOfCust = async (id) => {
    var distance;
    let noOfCustInArea = 0;
    try {
        const newlyGotOrder = await Orders.findById(id); // getting only online drivers
        const availOrders = await Orders.find({
            orderStatus: false
        }); // getting only online drivers
        for (var i = 0; i < availOrders.length; i++) {
            distance = await calcCrow(newlyGotOrder.pickUpLoc.coordinates[0], newlyGotOrder.pickUpLoc.coordinates[1], availOrders[i].pickUpLoc.coordinates[0], availOrders[i].pickUpLoc.coordinates[1]);
            if (distance < 10) { // puts drivers which are less than 10 km in array
                noOfCustInArea += 1;
            }
        }

        await Orders.findByIdAndUpdate(id, {
            $set: {
                ...newlyGotOrder,
                noOfCustInArea: noOfCustInArea
            }
        }, {
            new: true
        })
        //res.status(200).send({ updatedOrder , message : '*** Customers in 10km radius have been added ****' })
        return "Done";
    } catch (e) {
        console.log("Errr  is : ", e.message);
    }
}

// calculate Admin and  Driver Ammounts
const orderCancelledByCust = async (id) => {
    try {
        const gotOrder = await Orders.findById(id);
        if (!gotOrder) {
            return res.json({
                message: '*** Order Does Not Exists ****',
            });
        } else {
            const gotCustomer = await Customers.findById(gotOrder.postedBy);
            gotCustomer.paymentTotal += gotOrder.finalAmt / 2;
            await Customers.findByIdAndUpdate(gotOrder.postedBy, {
                $set: {
                    ...gotCustomer
                }
            }, {
                new: true
            })

            // upadting order
            gotOrder.finalAmt = gotOrder.finalAmt / 2;
            // these two functions will be called to add remaing amount to admina dn driver
            addAmtToAdmin();
            addDriverAmt();

            await Orders.findByIdAndUpdate(id, {
                $set: {
                    ...newlyGotOrder,
                    status: "cancelled"
                }
            }, {
                new: true
            })
            return "Done"
            //res.status(201).json({updatedCustomer , message: '*** 50% of total order amount has been deducted from your account as you have cacelled order before reached ***'})
        }
    } catch (error) {
        console.log("Error in deductAmtfromCust and error is : ", error)
    }
}

// calculate Admin and  Driver Ammounts
const orderCancelledByDriver = async (id) => {
    try {
        const gotOrder = await Orders.findById(id);
        if (!gotOrder) {
            return res.json({
                message: '*** Order Does Not Exists ****',
            });
        } else {
            const gotCustomer = await Customers.findById(gotOrder.postedBy);
            const gotAdmin = await Admin.findById({
                username: "admin"
            });

            // updating customer amount
            gotCustomer.paymentTotal = gotOrder.finalAmt;
            await Customers.findByIdAndUpdate(gotOrder.postedBy, {
                $set: {
                    ...gotCustomer
                }
            }, {
                new: true
            })

            const gotDriver = await Drivers.findById(gotOrder.finalDriver);

            // cutting 25% of driver  amount from his wallet
            let driverAmt = (gotOrder.driverGotAmt * 25) / 100;
            gotDriver.paymentTotal -= driverAmt;
            await Drivers.findByIdAndUpdate(gotOrder.finalDriver, {
                $set: {
                    ...gotDriver
                }
            }, {
                new: true
            })

            // adding that 25% of amount to admin
            gotAdmin.paymentTotal += driverAmt
            await Admin.findByIdAndUpdate(adminId, {
                $set: {
                    ...gotAdmin
                }
            }, {
                new: true
            })

            // updating order status back to false so that other drivers can bid on this
            const updatedOrder = await Orders.findByIdAndUpdate(id, {
                $set: {
                    ...gotOrder,
                    orderStatus: false
                }
            }, {
                new: true
            })
            return "Done"
            //res.status(201).json({updatedOrder , message: '*** Order has been cancelled by Driver successFully ***'})
        }
    } catch (error) {
        console.log("Error in deductAmtfromCust and error is : ", error)
    }
}

// update order
const updateOrder = async (req, res) => {
    const {
        id
    } = req.params
    if (!id) {
        return res.status(201).json({
            message: '*** Id is Required for Updation ****'
        })
    } else {
        let isOrderExist = await Orders.findById(id)
        if (!isOrderExist) {
            return res.status(201).json({
                message: '*** Customer Id is Incorrect ****'
            })
        } else {
            try {

                if (req.body.pickUpLoc) {
                    const loc = await geocoder.geocode(req.body.pickUpLoc);
                    isOrderExist.curntLoc = {
                        type: "Point",
                        coordinates: [loc[0].longitude, loc[0].latitude],
                    };
                }
                if (req.body.dropLoc) {
                    const loc = await geocoder.geocode(req.body.dropLoc);
                    isOrderExist.curntLoc = {
                        type: "Point",
                        coordinates: [loc[0].longitude, loc[0].latitude],
                    };
                }
                if (req.body.orderConfByAnyDriver) {
                    isOrderExist.orderConfByDrivers.push(req.body.orderConfByAnyDriver)
                }
                if (req.body.finalDriver) {
                    let newId = req.body.finalDriver.toString()
                    isOrderExist.finalDriver = newId;
                    isOrderExist.orderStatus = true;
                }
                if (req.body.avgSpeed) {
                    isOrderExist.avgSpeed = req.body.avgSpeed;
                }
                if (req.body.appoxSpeed) {
                    isOrderExist.appoxSpeed = req.body.appoxSpeed
                }
                if (req.body.ordercancelledByCustomer) {
                    isOrderExist.ordercancelledByCustomer = true
                }
                if (req.body.ordercancelledByDriver) {
                    isOrderExist.ordercancelledByDriver = true
                }
                if (req.body.tipAmt) {
                    isOrderExist.tipAmt = req.body.tipAmt;
                    const gotDriver = await Drivers.findById(isOrderExist.finalDriver);
                    gotDriver.paymentTotal += req.body.tipAmt
                    // adding amount to driver account
                    await Drivers.findByIdAndUpdate(isOrderExist.finalDriver, {
                        $set: {
                            ...gotDriver
                        }
                    }, {
                        new: true
                    })
                }

                if (isOrderExist.avgSpeed !== 0 && isOrderExist.appoxSpeed !== 0) {
                    let calulateAmt = await calcAmt(id);
                    if (calulateAmt !== "Done") {
                        return res.status(201).json({
                            message: '!!! error Occured while calculating amount of order !!!'
                        })
                    }
                    if (isOrderExist.ordercancelledByCustomer) {
                        let aw = await orderCancelledByCust(id);
                        if (aw !== "Done") {
                            return res.status(201).json({
                                message: '!!! error Occured while cancelling order from Customer !!!'
                            })
                        }
                    } else if (isOrderExist.ordercancelledByDriver) {
                        let ww = await orderCancelledByDriver(id);
                        if (ww !== "Done") {
                            return res.status(201).json({
                                message: '!!! error Occured while cancelling order from Driver !!!'
                            })
                        }
                    } else {
                        let deductAmtFrmCust = await deductAmtfromCust(id);
                        if (deductAmtFrmCust !== "Done") {
                            return res.status(201).json({
                                message: '!!! error Occured while Deducting amount from custoemr account !!!'
                            })
                        }

                        let admnAndDriverAmt = await calcAdminAmt(id);
                        if (admnAndDriverAmt !== "Done") {
                            return res.status(201).json({
                                message: '!!! error Occured while calculating admin amount !!!'
                            })
                        }

                        let adminAmt = await addAmtToAdmin(id);
                        if (adminAmt !== "Done") {
                            return res.status(201).json({
                                message: '!!! error Occured while adding amount to Admin !!!'
                            })
                        }

                        let driverAmt = await addDriverAmt(id);
                        if (driverAmt !== "Done") {
                            return res.status(201).json({
                                message: '!!! error Occured while adding amount to driver !!!'
                            })
                        }

                    }
                    const updatedOrder = await Orders.findByIdAndUpdate(id, {
                        $set: {
                            ...isOrderExist,
                            status: 'completed'
                        }
                    }, {
                        new: true
                    })
                    return res.status(201).json({
                        updatedOrder,
                        message: '*** Customer Completed SuccessFully ***'
                    })
                }

                //console.log(...req.body)
                const updatedOrder = await Orders.findByIdAndUpdate(id, {
                    $set: {
                        ...req.body,
                        ...isOrderExist
                    }
                }, {
                    new: true
                })

                res.status(201).json({
                    updatedOrder,
                    message: '*** Customer Updated SuccessFully ***'
                })
            } catch (error) {
                console.log("Error in updateOrder and error is : ", error)
                return res.status(201).json({
                    message: '!!! Opps An Error Occured !!!',
                    error
                })
            }
        }
    }
}

// get customer order info
const getCustomerOrderInfo = async (req, res) => {
    const {
        id
    } = req.params;
    console.log("Id : ", id)
    var distance = [];
    try {
        const gotOrder = await Orders.findById(id);
        for (var i = 0; i < gotOrder.orderConfByDrivers.length; i++) {
            const arr = await Drivers.findById(gotOrder.orderConfByDrivers[i])
            distance.push(arr)
        }
        res.status(200).send({
            distance,
            message: '*** Array of Drivers who have confirmed the order ****'
        })
    } catch (e) {
        console.log(e.message);
    }
}

// Stripe Payments
const makeStripePayment = async (req, res) => {
    const {
        id
    } = req.params;
    const {
        email,
        tokenId,
        cutomerId,
        userEmail,
        country
    } = req.body;
    try {
        const gotOrder = await Orders.findById(id);
        if (!gotOrder) {
            return res.json({
                message: '*** Order Does Not Exists ****',
            });
        } else {
            if (!gotOrder.finalDriver || gotOrder.orderStatus == false || gotOrder.finalAmt == 0) {
                return res.json({
                    message: '***You canot make payment without confirming order to any of driver ****',
                });
            } else {
                const idempotencyKey = uuid()

                stripe.customers.create({
                    email: email,
                    source: tokenId
                }).then(customer => {
                    stripe.charges.create({
                        amount: gotOrder.finalAmt * 100, // ultiply by 100 as stripe always gets paymemt in cents sor we mulitly this with 100 to convevrt to dollars
                        currency: 'usd',
                        customer: cutomerId,
                        receipt_email: userEmail,
                        description: `You have have been charged for your order i.e ${gotOrder.title} in using Moseing Trading Services `,
                        shipping: {
                            name: token.card.name,
                            address: {
                                country: country,

                            }
                        },
                    }, {
                        idempotencyKey
                    })
                }).then(result => {
                    // updating order status back to false so that other drivers can bid on this
                    const updateOrder = async () => {
                        const updatedOrder = await Orders.findByIdAndUpdate(id, {
                            $set: {
                                ...gotOrder,
                                paymentStatus: true
                            }
                        }, {
                            new: true
                        })
                        res.status(201).json({
                            updatedOrder,
                            message: '*** Order payment has been recieved from cutomer successFully ***'
                        })
                    }
                    updateOrder();
                }).catch(err => console.log("error in stripe payment i.e ", err))


            }
        }
    } catch (error) {
        console.log("Error in deductAmtfromCust and error is : ", error)
    }
}

// get all Orders count
const getOrdersCount = async (req, res) => {
    try {
        const count = await Orders.find({
            orderStatus: false
        }).count();
        if (!count) {
            return res.json({
                message: '*** No Orders or Cutsomer Found ****',
            });
        } else {
            return res.json({
                count,
                message: '*** Got Result ****',
            });
        }
    } catch (error) {
        console.log("Error in getOrdersCount and error is : ", error)
    }
}

// get all Orders
const getAllOrders = async (req, res) => {
    try {
        const allOrders = await Orders.find();
        if (!allOrders) {
            return res.json({
                message: '*** No Orders or Cutsomer Found ****',
            });
        } else {
            return res.json({
                allOrders,
                message: '*** Got Result ****',
            });
        }
    } catch (error) {
        console.log("Error in getAllOrders and error is : ", error)
    }
}


// get all Orders
const getAllOrdersByCust = async (req, res) => {
    const {
        id
    } = req.params;
    console.log("got is : ", id)
    try {
        const allOrders = await Orders.find({
            postedBy: id
        });
        if (!allOrders) {
            return res.json({
                message: '*** No Orders or Cutsomer Found ****',
            });
        } else {
            return res.json({
                allOrders,
                message: '*** All Orders by A Customer  ****',
            });
        }
    } catch (error) {
        console.log("Error in getAllOrders and error is : ", error)
    }
}


// get all Active Orders
const getActiveOrders = async (req, res) => {
    try {
        const allOrders = await Orders.find({
            orderStatus: false
        });
        if (!allOrders) {
            return res.json({
                message: '*** No Orders or Cutsomer Found ****',
            });
        } else {
            return res.json({
                allOrders,
                message: '*** Got Result ****',
            });
        }
    } catch (error) {
        console.log("Error in getAllOrders and error is : ", error)
    }
}

// get all cancelled Orders
const getCancelledOrders = async (req, res) => {
    try {
        const allOrders = await Orders.find({
            status: "cancelled"
        });
        if (!allOrders) {
            return res.json({
                message: '*** No Orders or Cutsomer Found ****',
            });
        } else {
            return res.json({
                allOrders,
                message: '*** Got Result ****',
            });
        }
    } catch (error) {
        console.log("Error in getCancelledOrders and error is : ", error)
    }
}

// get all cancelled Orders
const getSingleOrder = async (req, res) => {
    const {
        id
    } = req.params;

    try {
        const order = await Orders.findById(id);
        if (!order) {
            return res.json({
                message: '*** No Order  Found ****',
            });
        } else {
            return res.json({
                order,
                message: '*** Got Result ****',
            });
        }
    } catch (error) {
        console.log("Error in getSingleOrder and error is : ", error)
    }
}

// Converts numeric degrees to radians
function toRad(Value) {
    return Value * Math.PI / 180;
}
// functions finds distance bwteen two lats and langs and returns radius in kms
function calcCrow(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = toRad(lat2 - lat1);
    var dLon = toRad(lon2 - lon1);
    var lat1 = toRad(lat1);
    var lat2 = toRad(lat2);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d.toFixed(1);
}



module.exports = {
    addNewOrder,
    updateOrder,
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
}