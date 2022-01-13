const express = require('express')
const cors = require('cors')
const app = express();
const bodyParser = require('body-parser')
const Secret_Key = process.env.Secret_Key
const dotenv = require('dotenv')
dotenv.config({path: './config.env'})
const fileupload = require("express-fileupload")
require('./db/conn')
var port = process.env.PORT || 8080;

app.use(bodyParser.json({limit: '30mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '30mb', extended: true}))
app.use(cors())

app.use(fileupload({
    useTempFiles : true
}))

const stripe = require('stripe')(Secret_Key)

app.use(express.json())

// adding routes
app.use(require('./routes/CustomerRoutes'))
app.use(require('./routes/DriverRoutes'))
app.use(require('./routes/TrucksRoutes'))
app.use(require('./routes/AdminRoutes'))
app.use(require('./routes/OrderRoutes'))
// app.use(require('./routes/BidsRoutes'))



app.listen( process.env.PORT || 8080, (req, res) => {
    console.log(`Express Server Running at ${port}`)
})