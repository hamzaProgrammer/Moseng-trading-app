const Customers = require('../models/UserSchema')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const nodeMailer = require("nodemailer");
const {
    geocoder
} = require('../models/GeoCoder');
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const JWT_CUSTOMER_KEY = process.env.JWT_CUSTOMER_KEY;

// signin Up
const addNewCustomer = async (req, res) => {
    const {
        email,
        fullname,
        password,
        phoneNo
    } = req.body;
    if (!email || !fullname || !password || !phoneNo) {
        return res.json({
            message: "Please fill All required credentials"
        });
    } else {
        const check = await Customers.find({
            email: email
        })
        if (check.length > 0) {
            return res.json({
                message: '*** Email Already taken ***'
            })
        } else {
            const hashedPassword = await bcrypt.hash(password, 10); // hashing password

            const newUser = new Customers({
                ...req.body,
                password: hashedPassword
            })
            try {
                const addedCustomer = await newUser.save();

                res.status(201).json({
                    addedCustomer,
                    message: '*** Customer SuccessFully Added ***'
                })
            } catch (error) {
                console.log("Error in addNewCustomer and error is : ", error)
            }
        }
    }
}

// Logging In
const LogInCustomer = async (req, res) => {
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
            const isCustomerExists = await Customers.findOne({
                email
            });

            if (!isCustomerExists) {
                return res.json({
                    message: "*** Costumer Not Found ***"
                })
            }

            const isPasswordCorrect = await bcrypt.compare(password, isCustomerExists.password); // comparing password
            if (!isPasswordCorrect) {
                return res.json({
                    message: '*** Invalid Credientials ***'
                })
            }

            const token = jwt.sign({
                id: isCustomerExists._id
            }, JWT_CUSTOMER_KEY, {
                expiresIn: '24h'
            }); // gentating token

            return res.json({
                myResult: isCustomerExists,
                message: '*** Customer Signed In SuccessFully ****',
                token
            });
        } catch (error) {
            console.log("Error in LogInCustomer and error is : ", error)
        }
    }

}

// sending mails
const sendMail = async (req, res) => {
    const {
        email
    } = req.body;
    const data = await Customers.find({
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
                    let ww = await Customers.findOneAndUpdate({
                        email: email
                    }, {
                        $set: {
                            ...req.body,
                            optpCode: randomNo,
                            tokenSentTime: curntDateTime
                        }
                    }, {
                        new: true
                    })
                    console.log("res : ", ww)
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
    const data = await Customers.find({
        email: email
    });
    console.log("data : ", data, data[0]);
    const {
        optpCode
    } = req.body;
    if (data) {
        let curntDateTime = new Date();
        let diff = new Date(curntDateTime.getTime() - data[0].tokenSentTime.getTime()) / 1000; //  getting time diff in seconds
        parseInt(diff)
        if (diff < 60) { // checking if sent time is less than 60 seconds
            try {
                if (optpCode == data[0].optpCode) {
                    const update = await Customers.findOneAndUpdate({
                        email: email
                    }, {
                        $set: {
                            ...req.body,
                            tokenSentTime: null,
                            optpCode: null
                        }
                    }, {
                        new: true
                    })

                    if (update) {
                        return res.status(201).json({
                            update,
                            message: '*** Customer OtpCode Matched SuccessFully ***'
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


// uodate user
const updateCustomer = async (req, res) => {
    const {
        id
    } = req.params
    if (!id) {
        return res.status(201).json({
            message: '*** Id is Required for Updation ****'
        })
    } else {
        const isExist = await Customers.findById(id)
        if (!isExist) {
            return res.status(201).json({
                message: '*** Customer Id is Incorrect ****'
            })
        } else {
            try {
                if (req.body.curntLoc) {
                    const loc = await geocoder.geocode(req.body.curntLoc);
                    req.body.curntLoc = {
                        type: "Point",
                        coordinates: [loc[0].latitude, loc[0].longitude],
                    };
                }
                const updatedUser = await Customers.findByIdAndUpdate(id, {
                    $set: req.body
                }, {
                    new: true
                })

                res.status(201).json({
                    updatedUser,
                    message: '*** Customer Updated SuccessFully ***'
                })
            } catch (error) {
                console.log("Error in updateCustomer and error is : ", error)
                return res.status(201).json({
                    message: '!!! Opps An Error Occured !!!',
                    error
                })
            }
        }
    }
}

// uodate user password only
const updateCustomerPass = async (req, res) => {
    const {
        email
    } = req.params
    if (!email) {
        return res.status(201).json({
            message: '*** Email is Required for Updation ****'
        })
    } else {
        const isExist = await Customers.findOne({
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
                    message: '*** Customer Updated SuccessFully ***'
                })
            } catch (error) {
                console.log("Error in updateCustomerPass and error is : ", error)
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
        const deleteUser = await Customers.findByIdAndDelete(id);
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

// get all Customers
const getAllCustomersCount = async (req, res) => {
    try {
        const count = await Customers.find({}).count();
        console.log("Count : ", count)
        if (!count) {
            return res.json({
                message: '*** No Customers or Cutsomer Found ****',
            });
        } else {
            return res.json({
                count,
                message: '*** Got Result ****',
            });
        }
    } catch (error) {
        console.log("Error in LogInCustomer and error is : ", error)
    }
}


// get all Customers
const getAllCustomers = async (req, res) => {
    try {
        const allCustomers = await Customers.find({});
        if (!allCustomers) {
            return res.json({
                message: '*** No Customers or Cutsomer Found ****',
            });
        } else {
            return res.json({
                allCustomers,
                message: '*** Got Result ****',
            });
        }
    } catch (error) {
        console.log("Error in LogInCustomer and error is : ", error)
    }
}




// get Single Customers
const getSingleCustomer = async (req, res) => {
    const {
        id
    } = req.params;
    try {
        const singleCustomer = await Customers.findById(id);
        if (!singleCustomer) {
            return res.json({
                message: '*** No Customers or Cutsomer Found ****',
            });
        } else {
            return res.json({
                singleCustomer,
                message: '*** Got Result ****',
            });
        }
    } catch (error) {
        console.log("Error in getSingleCustomer and error is : ", error)
    }
}


module.exports = {
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
}