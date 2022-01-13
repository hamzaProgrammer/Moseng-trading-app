## Truck App Api Details (Moseng Trading Services)

BaseURL: http://localhost:8080 (Local Server)
BaseURL: https://mtechub-tradingapp21.herokuapp.com (Deployed Server)



## ##################################### Admin



## Login

    URL: /api/admin/signin  (Post)
    @Access Public

    -Request :It need
                    email*(String)
                    password*(String)

    -Response : And you get message,token,Result



## Update Admin Account

    URL: /api/admin/updateAdmin/:id  (Put)
    @Access Public

    -Request :It need
                    id* (String)
                    password (String)
                    username (String)

    -Response : And you get message,updatedAdmin



## Delete Admin Account

    URL: /api/admin/deleteAdmin/:id  (Put)
    @Access Public

    -Request :It need
                    id* (String)

    -Response : And you get message,updatedAdmin




## ##################################### Customers



## Sign Up Customer

    URL: /api/cutomer/register  (Post)
    @Access Public

    -Request :It need
                    email*(String)
                    fullname*(String)
                    password*(String)
                    phoneNo*(String)

    -Response : And you get message,addedCustomer



## Sign In Customer

    URL: /api/cutomer/signin  (Post)
    @Access Public

    -Request :It need
                    email*(String)
                    password*(String)


    -Response : And you get message,token,Result



## Update Customer

    URL: /api/cutomer/updateCustomer/:id  (Put)
    @Access Public

    -Request :It need
                    id*(String)
                    password (String)
                    curntLoc (Coordinates)
                    phoneNo (Number)
                    paymentTotal (Number)
                    optpCode (String)
                    tokenSentTime (Date)


    -Response : And you get message,updatedCustomer



## Delete Customer

    URL: /api/cutomer/deleteCustomer/:id  (Delete)
    @Access Public

    -Request :It need
                    id*(String)


    -Response : And you get message,deletedCustomer



## Fetch Online Drivers

    URL: /api/driver/fetchOnlineOrders/:id  (Put)
    @Access Public

    -Request :It need
                    id*(String)  (Id of newly placed Order)


    -Response : And you get message,onlineDriver




## Send Mail (In case of forget password)

    URL: /api/cutomer/checkEmailExists  (Post)
    @Access Public

    -Request :It need
                    mail*(String)


    -Response : And you get message,sentMail



## Verify Code (In case of forget password)

    URL: /api/cutomer/checkOtpCode/:id  (Post)
    @Access Public

    -Request :It need
                    optpCode*(String)


    -Response : And you get message,sentMail



## ##################################### Drivers



## Sign Up Driver

    URL: /api/driver/register  (Post)
    @Access Public

    -Request :It need
                    email* (String)
                    fullname* (String)
                    password* (String)
                    phoneNo* (String)


    -Response : And you get message,addedDriver



## Login Driver

    URL: /api/driver/signin  (Post)
    @Access Public

    -Request :It need
                    email* (String)
                    password* (String)


    -Response : And you get message,gotDriver





## Update Driver (when driver adds his documents)

    URL: /api/driver/updateDriver/:id  (Put)
    @Access Public

    -Request :It need
                    password (String)
                    curntLoc (Coordinates)
                    idCard (String)
                    idCardPic (String)
                    carInspectReport (String)
                    driverPic (String)
                    carLiscDescPic (String)
                    carInsureanceReport (String)
                    acctStatus (Boolean)
                    widthDrawlDate (Date)
                    acctStatus (Boolean)
                    paymentTotal (Number)
                    rating (Number)
                    noOfCustRatings (Number)
                    noOfOrders (Number)
                    noOfOrdersCancelled (Number)
                    noOfOrdersCompleted (Number)
                    noOfOrders (Number)
                    menufacturer (String)
                    year (date)
                    regNo (String)
                    color (String)
                    liscnceNo (String)
                    vinNo (String)
                    drivLisc (String) (Picture)
                    idCard (String) (Picture)
                    regNo (String)
                    liscExpDate (String)
                    idCardPic (String) (Picture)
                    carInspectReport (String) (Picture)
                    driverPic (String) (Picture)
                    carLiscDescPic (String) (Picture)
                    carInsureanceReport (String) (Picture)
                    activeStatus (Boolean)
                    availOrders ([Object Id])
                    activeStatus (Boolean)
                    confirmedOrders ([ObjectId])




    -Response : And you get message,updatedDriver



## Delete Driver

    URL: /api/driver/deleteDriverCustomer/:id  (Delete)
    @Access Public

    -Request :It need


    -Response : And you get message,deletedDriver



## Send Mail

    URL: /api/driver/checkEmailExists  (Post)
    @Access Public

    -Request :It need
                mail* (String)

    -Response : And you get message,deletedDriver




## check Otpt Code

    URL: /api/driver/checkOtpCode/:id (Post)
    @Access Public

    -Request :It need
                otptCode* (Number)

    -Response : And you get message,deletedDriver




## With Draw Amount

    URL: /api/driver/withDrawAmt/:id (Put)   // id of customer
    @Access Public

    -Request :It need
                amount* (Number)

    -Response : And you get message




## fetch Avail Orders

    URL: /api/driver/fetchOnlineOrders/:id (Put)   // id of newly placed order
    @Access Public

    -Request :It need


    -Response : And you get message,deletedDriver






## ##################################### Orders


## Add Order

    URL: /api/cutomer/updateCustomer/:id  (Post)
    @Access Public

    -Request :It need
                    title* (String)
                    price* (String)
                    date* (Date)
                    desc* (String)
                    postedBy* (ObjectId)
                    pickUpLoc* (Coordinates)
                    dropLoc* (Coordinates)
                    truckId* (ObjectId)
                    reviewOfOrder (Number)
                    noOfCustInArea (Number)
                    noOfTrucksInArea (Number)
                    smf (Number)
                    avgSpeed (Number)
                    appoxSpeed (Number)
                    tmf (Number)
                    adminAmt (Number)
                    totalDist (Number)
                    finalDist (Number)
                    finalAmt (Number)
                    tipAmt (Number)
                    orderStatus (Boolean)
                    finalDriver (ObjectId)
                    orderConfByDrivers ([ObjectId])
                    status (String)


    -Response : And you get message,addedOrder



## Fetch Online Customers in specified region

    URL: /api/order/fetchOnlineCustomers/:id  (Put)
    @Access Public

    -Request :It need
                    id*(String)   (id of newly placed order)


    -Response : And you get message,availCustomersNo.




## Update Order

    URL: /api/order/updateOrder/:id  (Put)
    @Access Public

    -Request :It need
                    id*(String)   (id of newly placed order)
                    pickUpLoc (Coordinates)
                    dropLoc (Coordinates)
                    orderConfByAnyDriver (ObjectId)
                    finalDriver (ObjectId)
                    avgSpeed (Number)
                    appoxSpeed (Number)
                    tipAmt (Number)

    -Response : And you get message,updatedCustomer




## Calculate Total Amount of Order

    URL: /api/order/calcOrderAmt/:id/:adminId  (Put)
    @Access Public

    -Request :It need
                    id*(String)   (id of newly placed order)


    -Response : And you get message,updatedCustomer



## Calculate Total Amount of Admin

    URL: /api/order/addToAdminAcc/:id  (Put)
    @Access Public

    -Request :It need
                    id*(String)   (id of newly placed order)


    -Response : And you get message,updatedCustomer



## Calculate Total Amount of Customer

    URL: /api/order/addToDriverAcc/:id  (Put)
    @Access Public

    -Request :It need
                    id*(String)   (id of newly placed order)


    -Response : And you get message,updatedCustomer



## Deduct Amount of order from cutomer account

    URL: /api/order/deductAmtfromCust/:id  (Put)
    @Access Public

    -Request :It need
                    id*(String)   (id of newly placed order)


    -Response : And you get message,updatedCustomer



## Calculating Amount of admin and driver in specified order

    URL: /api/order/calcAdminAmt/:id  (Put)
    @Access Public

    -Request :It need
                    id*(String)   (id of newly placed order)


    -Response : And you get message,updatedCustomer



## Order cancel by Customer

    URL: /api/order/ordrCancelledByCust/:id  (Put)
    @Access Public

    -Request :It need
                    id*(String)   (id of newly placed order)


    -Response : And you get message,updatedCustomer



## Order cancel by Driver

    URL: /api/order/ordrCancelledBDriver/:id/:adminId  (Put)
    @Access Public

    -Request :It need
                    id* (String)   (id of newly placed order)
                    adminId* (String)   (id of admin account)


    -Response : And you get message,updatedCustomer



## ##################################### Trucks




## Add New Truck

    URL: /api/truck/addNew  (Post)
    @Access Public

    -Request :It need
                    name* (String)
                    size* (Number)
                    standeredRate* (Number)
                    ratesPerKm* (Number)
                    freeKm* (Number)


    -Response : And you get message,addedTruck



## Update Truck

    URL: /api/truck/updateTruck/:id  (Put)
    @Access Public

    -Request :It need
                    id* (String)

    -Response : And you get message,updatedTruck



## Delete Truck

    URL: /api/truck/deleteTruck/:id  (Delete)
    @Access Public

    -Request :It need
                    id* (String)

    -Response : And you get message,deletedTruck


## get Single Truck

    URL: /api/truck/getSingleTruck/:id  (Get)
    @Access Public

    -Request :It need
                    id* (String)

    -Response : And you get message,singleTruck


## get All Truck

    URL: /api/truck/getAllTruck  (Get)
    @Access Public

    -Request :It need


    -Response : And you get message,allTrucks



## get Trucks by Size or Name

    URL: /api/truck/getTrucksBySize/:size  (Get)
    @Access Public

    -Request :It need
                size* (String)   (here size may be a name of truck or size of any truck)

    -Response : And you get message,allTrucks