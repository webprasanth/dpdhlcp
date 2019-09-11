const express = require('express')
const swaggerJSDoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')
const app = express()

const { port } = require("./config")


/** For localhost code */
// const hostName = `localhost:${port}`
// const swaggerAPIsPath = 'src/swagger/*.js'

/** For deployed code */
const hostName = 'cpapiapp.azurewebsites.net'
const swaggerAPIsPath = 'swagger/*.js'


// options for swagger jsdoc 
var options = {
  swaggerDefinition: {
    info: {
      title: 'CP APIs',
      version: '1.0.0',
      description: 'DHL-IOT common portal APIs',
    },
    host: hostName,
    basePath: '/api/beta',
    consumes: [
      "application/json"
    ],
    produces: [
      "application/json"
    ],
    schemes: ['http', 'https'],
    securityDefinitions: {
      JWT: {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization',
          description: "",
      }
    }
  },
  apis: [ swaggerAPIsPath ] // Relative path where API specification are written
}

// initialize swaggerJSDoc
var swaggerSpec = swaggerJSDoc(options)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// route for swagger.json
app.get('/swagger.json', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
})

module.exports = app