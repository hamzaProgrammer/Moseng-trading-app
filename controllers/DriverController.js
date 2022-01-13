const Drivers = require('../models/DriverSchema')
const Orders = require('../models/OrderSchema')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const nodeMailer = require("nodemailer");
const {
    geocoder
} = require('../models/GeoCoder');
const JWT_DRIVER_KEY = process.env.JWT_DRIVER_KEY;
var cloudinary = require('cloudinary').v2

cloudinary.config({
    cloud_name: 'hamza-store',
    api_key: '555344286478932',
    api_secret: 'e29ILHc_vrGqW0vER0gJEVi1ZVQ',
});

// signin Up
const addNewDriver = async (req, res) => {
    const {
        email,
        fullname,
        password,
        phoneNo,
        city,
        language,
        refCode
    } = req.body;
    if (!email || !fullname || !password || !phoneNo || !city || !language || !refCode) {
        return res.json({
            message: "Please fill All required credentials"
        });
    } else {
        const check = await Drivers.find({
            email: email
        })
        if (check.length > 0) {
            return res.json({
                message: '*** Email Already taken ***'
            })
        } else {
            const hashedPassword = await bcrypt.hash(password, 10); // hashing password
            const newUser = new Drivers({
                ...req.body,
                password: hashedPassword,
                acctStatus: false
            })
            console.log("newUser : ", newUser)
            try {
                const addedDriver = await newUser.save();
                console.log("addedDriver : ", addedDriver)

                res.status(201).json({
                    addedDriver,
                    message: '*** Driver SuccessFully Added ***'
                })
            } catch (error) {
                console.log("Error in addNewDriver and error is : ", error)
            }
        }
    }
}

// Logging In
const LogInDriver = async (req, res) => {
    const {
        email,
        password
    } = req.body

    if (!email || !password) {
        return res.json({
            mesage: "**** Please fill Required Credientials ***"
        })
    } else {
        try {
            const isDriverExists = await Drivers.findOne({
                email
            });

            if (!isDriverExists) {
                return res.json({
                    message: "*** Costumer Not Found ***"
                })
            }
            // checking if account of driver has been approved or not
            //if(isDriverExists.acctStatus != false){
            //if(isDriverExists.acctStatus != false){
            const isPasswordCorrect = await bcrypt.compare(password, isDriverExists.password); // comparing password
            if (!isPasswordCorrect) {
                return res.json({
                    message: '*** Invalid Credientials ***'
                })
            }

            const token = jwt.sign({
                id: isDriverExists._id
            }, JWT_DRIVER_KEY, {
                expiresIn: '24h'
            }); // gentating token

            return res.json({
                myResult: isDriverExists,
                message: '*** Customer Signed In SuccessFully ****',
                token
            });
            // }else{ // if not approved
            //     return res.json({ message: "*** Your Account has not been yet Verified by Admin , Please try again after some time ***"})
            // }

        } catch (error) {
            console.log("Error in LogInDriver and error is : ", error)
        }
    }

}

// sending mails
const sendMail = async (req, res) => {
    const {
        email
    } = req.body;
    const data = await Drivers.find({
        email: email
    });
    if (data) {
        const curntDateTime = new Date();
        let randomNo = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);

        // step 01
        const transport = nodeMailer.createTransport({
            service: "gmail",
            auth: {
                user: "doorstep1000@gmail.com", //own eamil
                pass: "hamza_78674", // own password
            }
        })

        // setp 02
        const mailOption = {
            from: "doorstep1000@gmail.com", // sender/own eamil
            to: email, // reciver eamil
            subject: "Verification Code for **** Site  ****",
            text: `Dear Customer , your secret no is ${randomNo}. This will expire in next 60`
        }

        // step 03
        transport.sendMail(mailOption, (err, info) => {
            if (err) {
                console.log("Error occured : ", err)
                return res.json({
                    mesage: "**** Error in sending mail ***",
                    err
                })
            } else {
                console.log("Email Sent and info is : ", info.response)
                const uptCust = async () => {
                    await Drivers.findOneAndUpdate({
                        email: email
                    }, {
                        $set: {
                            ...data,
                            optpCode: randomNo,
                            tokenSentTime: curntDateTime
                        }
                    }, {
                        new: true
                    })
                }
                uptCust();
                return res.json({
                    mesage: "**** Verification code sent to your Email which will expire in next 60 seconds ***"
                })
            }
        })
    } else {
        return res.json({
            mesage: "**** Email Not Found ***"
        })
    }
}


// changing password
const checkOtpCode = async (req, res) => {
    const {
        email
    } = req.params;
    const data = await Drivers.find({
        email: email
    });
    console.log("data : ", data, data[0])
    const {
        optpCode
    } = req.body;
    if (data) {
        let curntDateTime = new Date();
        let diff = new Date(curntDateTime.getTime() - data[0].tokenSentTime.getTime()) / 1000; //  getting time diff in seconds
        parseInt(diff)
        if (diff < 60) { // checking if sent time is less than 60 seconds
            try {
                console.log("inside ")
                if (optpCode == data[0].optpCode) {
                    const update = await Drivers.findOneAndUpdate({
                        email: email
                    }, {
                        $set: {
                            ...data.body,
                            tokenSentTime: null,
                            optpCode: null
                        }
                    }, {
                        new: true
                    })
                    console.log("Matched")
                    if (update) {
                        return res.status(201).json({
                            update,
                            message: '*** Driver OtpCode Matched SuccessFully ***'
                        })
                    }
                } else {
                    return res.status(201).json({
                        message: '***  InValid Token  ***'
                    })
                }
            } catch (error) {
                console.log("Error is :", error)
                return res.status(201).json({
                    message: '!!! Opps An Error Occured !!!',
                    error
                })
            }
        } else {
            return res.status(201).json({
                message: '!!! Time for Your Token Expired !!!'
            })
        }
    } else {
        return res.status(201).json({
            message: '!!! InValid Credinatials !!!'
        })
    }
}


// uodate user password only
const updateDriverPass = async (req, res) => {
    const {
        email
    } = req.params
    if (!email) {
        return res.status(201).json({
            message: '*** Email is Required for Updation ****'
        })
    } else {
        const isExist = await Drivers.findOne({
            email: email
        })
        if (!isExist) {
            return res.status(201).json({
                message: '*** Email is Incorrect ****'
            })
        } else {
            try {
                if (req.body.password) {
                    req.body.password = await bcrypt.hash(req.body.password, 10); // hashing password
                }

                const updatedUser = await Customers.findOneAndUpdate({
                    email: email
                }, {
                    $set: req.body
                }, {
                    new: true
                })

                res.status(201).json({
                    updatedUser,
                    message: '*** Driver Updated SuccessFully ***'
                })
            } catch (error) {
                console.log("Error in updateDriverPass and error is : ", error)
                return res.status(201).json({
                    message: '!!! Opps An Error Occured !!!',
                    error
                })
            }
        }
    }
}

// update user
const updateDriver = async (req, res) => {
    const {
        id
    } = req.params
    if (!id) {
        return res.status(201).json({
            message: '*** Id is Required for Updation ****'
        })
    } else {
        let isExist = await Drivers.findById(id)
        if (!isExist) {
            return res.status(201).json({
                message: '*** Customer Id is Incorrect ****'
            })
        } else {
            try {
                if (req.files.idCard) {
                    await cloudinary.uploader.upload(req.files.idCard.tempFilePath, (err, res) => {
                        req.body.idCard = res.url;
                    })
                }
                if (req.files.idCardPic) {
                    await cloudinary.uploader.upload(req.files.idCardPic.tempFilePath, (err, res) => {
                        req.body.idCardPic = res.url;
                    })
                }
                if (req.files.carInspectReport) {
                    await cloudinary.uploader.upload(req.files.carInspectReport.tempFilePath, (err, res) => {
                        req.body.carInspectReport = res.url;
                    })
                }
                if (req.files.driverPic) {
                    await cloudinary.uploader.upload(req.files.driverPic.tempFilePath, (err, res) => {
                        req.body.driverPic = res.url;
                    })
                }
                if (req.files.carLiscDescPic) {
                    await cloudinary.uploader.upload(req.files.carLiscDescPic.tempFilePath, (err, res) => {
                        req.body.carLiscDescPic = res.url;
                    })
                }
                if (req.files.carInsureanceReport) {
                    await cloudinary.uploader.upload(req.files.carInsureanceReport.tempFilePath, (err, res) => {
                        req.body.carInsureanceReport = res.url;
                    })
                }
                if (req.body.acctStatus) {
                    if (isExist.idCard && isExist.idCardPic && isExist.carInspectReport && isExist.driverPic && isExist.carLiscDescPic && isExist.carInsureanceReport) {
                        req.body.acctStatus = true;
                    } else {
                        return res.status(201).json({
                            message: '!!! You can not approve this , as some of documents are still remaing to be attached !!!'
                        })
                    }
                }


                const updatedUser = await Drivers.findByIdAndUpdate(id, {
                    $set: {
                        ...req.body
                    }
                }, {
                    new: true
                })
                res.status(201).json({
                    updatedUser,
                    message: '*** Customer Updated SuccessFully ***'
                })
            } catch (error) {
                console.log("Error in updateDriver and error is : ", error)
                return res.status(201).json({
                    message: '!!! Opps An Error Occured !!!',
                    error
                })
            }
        }
    }
}


// update user Docs
const updateDriverInfo = async (req, res) => {
    const {
        id
    } = req.params
    if (!id) {
        return res.status(201).json({
            message: '*** Id is Required for Updation ****'
        })
    } else {
        let isExist = await Drivers.findById(id)
        if (!isExist) {
            return res.status(201).json({
                message: '*** Customer Id is Incorrect ****'
            })
        } else {
            try {
                if (req.body.password) {
                    req.body.password = await bcrypt.hash(password, 10); // hashing password
                }
                if (req.body.curntLoc) {
                    const loc = await geocoder.geocode(req.body.curntLoc);
                    console.log("Loc : ", loc[0])
                    req.body.curntLoc = {
                        type: "Point",
                        coordinates: [loc[0].latitude, loc[0].longitude],
                    };
                }
                if (req.body.acctStatus) {
                    if (isExist.idCard && isExist.idCardPic && isExist.carInspectReport && isExist.driverPic && isExist.carLiscDescPic && isExist.carInsureanceReport) {
                        req.body.acctStatus = true;
                    } else {
                        return res.status(201).json({
                            message: '!!! You can not approve this , as some of documents are still remaing to be attached !!!'
                        })
                    }
                }

                const updatedUser = await Drivers.findByIdAndUpdate(id, {
                    $set: {
                        ...req.body
                    }
                }, {
                    new: true
                })
                res.status(201).json({
                    updatedUser,
                    message: '*** Customer Documents Updated SuccessFully ***'
                })
            } catch (error) {
                console.log("Error in updateDriverInfo and error is : ", error)
                return res.status(201).json({
                    message: '!!! Opps An Error Occured !!!',
                    error
                })
            }
        }
    }
}

// delete my account
const deleteAccount = async (req, res) => {
    const {
        id
    } = req.params;
    try {
        const deleteUser = await Drivers.findByIdAndDelete(id);
        if (!deleteUser) {
            return res.json({
                message: '*** Account Not Found ****',
            });
        } else {
            return res.json({
                deleteUser,
                message: '*** Account SuccessFully Deleted ****',
            });
        }
    } catch (error) {
        console.log("Error in deleteAccount and error is : ", error)
    }
}


// Withdraw amount
const widthDrawAmt = async (req, res) => {
    const {
        id
    } = req.params;
    const {
        amount
    } = req.body
    let amtToDeduce = Number(amount);
    if (!id || !amount) {
        return res.status(201).json({
            message: '*** Payment and Id of Driver are Required for Making payment ****'
        })
    } else {
        let isExistDriver = await Drivers.findById(id)
        if (!isExistDriver) {
            return res.status(201).json({
                message: '*** Driver Id is Incorrect ****'
            })
        } else {
            try {
                if (amtToDeduce > isExistDriver.paymentTotal) {
                    return res.status(201).json({
                        message: '*** Entered Amount is greater than available amount ****'
                    })
                } else {
                    var curntDate = new Date();
                    var withdrawlDated = isExistDriver.widthDrawlDate;
                    if (withdrawlDated === null) {
                        let finalAMT = Number(isExistDriver.paymentTotal) - amtToDeduce
                        isExistDriver.paymentTotal = finalAMT;
                        isExistDriver.widthDrawlDate = curntDate;
                        isExistDriver.widthDrawlDate = curntDate;
                        let updatedDriver = await Drivers.findByIdAndUpdate(id, {
                            $set: {
                                ...isExistDriver
                            }
                        }, {
                            new: true
                        })
                        return res.status(201).json({
                            updatedDriver,
                            message: '*** Payment Deducted SuccessFully ***'
                        })
                    }
                    var diff = new Date(curntDate.getTime() - withdrawlDated.getTime());
                    if ((diff.getUTCDate() - 1) > 7) { // get diff between dates in days i.e driver will only able to withdraw amoint m if diff is greater than 7 days
                        let finalAMT = Number(isExistDriver.paymentTotal) - amtToDeduce
                        isExistDriver.paymentTotal = finalAMT;
                        isExistDriver.widthDrawlDate = curntDate;
                        let updatedDriver = await Drivers.findByIdAndUpdate(id, {
                            $set: {
                                ...isExistDriver
                            }
                        }, {
                            new: true
                        })

                        res.status(201).json({
                            updatedDriver,
                            message: '*** Payment Deducted SuccessFully ***'
                        })
                    } else {
                        return res.status(201).json({
                            message: `*** Your are not able to widthdraw amount as your previous widthdrawl date is ${isExistDriver.widthDrawlDate}. After 7 days of previous withdrwal you will be able to withdraw amount agian. Thanks. ****`
                        })
                    }
                }
            } catch (error) {
                console.log("Error in widthDrawAmt and error is : ", error)
                return res.status(201).json({
                    message: '!!! Opps An Error Occured !!!',
                    error
                })
            }
        }
    }
}

// get all active drivers in loc bewteen
const fetchAvailOrders = async (id) => {
    let noOfTrucksInArea = 0;
    var distance;
    try {
        const newlyGotOrder = await Orders.findById(id);
        const avalDrivers = await Drivers.find({
            activeStatus: false
        });
        for (var i = 0; i < avalDrivers.length; i++) {
            distance = await calcCrow(avalDrivers[i].curntLoc.coordinates[0], avalDrivers[i].curntLoc.coordinates[1], newlyGotOrder.pickUpLoc.coordinates[0], newlyGotOrder.pickUpLoc.coordinates[1]);
            console.log(newlyGotOrder.pickUpLoc.coordinates[0], newlyGotOrder.pickUpLoc.coordinates[1], avalDrivers[i].curntLoc.coordinates[0], avalDrivers[i].curntLoc.coordinates[1])
            console.log("Distance : ", distance, "id : ", avalDrivers[i]._id)
            if (distance < 10) { // puts drivers which are less than 10 km in array
                noOfTrucksInArea += 1;
                newlyGotOrder.noOfTrucksInArea = noOfTrucksInArea;
                let newId = avalDrivers[i]._id.toString()
                console.log("Id going to be added", newId)
                //console.log("New Id : ", newId)
                const ww = await Drivers.findByIdAndUpdate(newId, {
                    $push: {
                        availOrders: id
                    }
                }, {
                    new: true
                })
                const qq = await Orders.findByIdAndUpdate(id, {
                    $set: {
                        ...newlyGotOrder
                    }
                }, {
                    new: true
                })
                //console.log("Inside ", ww , qq)

            }
            distance = 0;
        }
        return "Done"

        //res.status(200).send({message : '*** Orders  in 10km radius have been added ****' })
    } catch (e) {
        console.log(e.message);
    }
}

// get single driver info
const getDriverInfo = async (req, res) => {
    console.log("Going to call")
    const {
        id
    } = req.params;
    console.log("Id : ", id)
    var distance = [];
    try {
        const gotDriver = await Drivers.findById(id);
        for (var i = 0; i < gotDriver.availOrders.length; i++) {
            const arr = await Orders.findById(gotDriver.availOrders[i])
            distance.push(arr)
        }
        res.status(200).send({
            distance,
            message: '*** Array of oders have been recived ****'
        })
    } catch (e) {
        console.log(e.message);
    }
}

// get all Orders count
const getDriversCount = async (req, res) => {
    try {
        const count = await Drivers.find().count();
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
        console.log("Error in getDriversCount and error is : ", error)
    }
}

// get all Orders count
const getAllDrivers = async (req, res) => {
    try {
        const allDrivers = await All.find({});
        if (!allDrivers) {
            return res.json({
                message: '*** No Drivers Found ****',
            });
        } else {
            return res.json({
                allDrivers,
                message: '*** Got Result ****',
            });
        }
    } catch (error) {
        console.log("Error in getAllDrivers and error is : ", error)
    }
}

// get single driver
const getSingleDriver = async (req, res) => {
    const {
        id
    } = req.params;
    try {
        const singleDriver = await All.findById(id);
        if (!singleDriver) {
            return res.json({
                message: '*** No Drivers Found ****',
            });
        } else {
            return res.json({
                singleDriver,
                message: '*** Got Result ****',
            });
        }
    } catch (error) {
        console.log("Error in getSingleDriver and error is : ", error)
    }
}



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
// Converts numeric degrees to radians
function toRad(Value) {
    return Value * Math.PI / 180;
}


module.exports = {
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
}