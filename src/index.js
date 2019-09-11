const express = require('express')
const bodyParser = require('body-parser')
const helmet = require('helmet')
const cors = require('cors')
const appInsights = require("applicationinsights")
const expressvalidator = require('express-validator')
require('dotenv').config()

const routes = require('./routes')
const swagger = require('./swagger')

const { port } = require("./config")
const app = express()


process.on('uncaughtException', (err) => {
    console.error('There was an uncaught error', err)
    process.exit(1) //mandatory (as per the Node docs)
})

// adding Helmet to enhance API's security
app.use(helmet());

// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended : true}))

// enabling CORS for all requests
app.use(cors())

app.use(expressvalidator())

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, POST, PATCH, GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, A-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', true)
  next()
})

//error handlers
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).json({ status : 500, error : 'Something went wrong!!' });
});

appInsights.setup("44763b7f-b0f1-4cf4-8f1a-28454f8f0ca3").setSendLiveMetrics(true).start()

//routers
app.use('/api/beta', routes)
app.use('/', swagger)

app.listen(port, () => {
    console.log(`Sever is running on port : ${port}`)
})
