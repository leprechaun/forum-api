import bodyParser from 'body-parser'
import express from 'express'
import http from 'http'
import path from 'path'
import multer from 'multer'

import { initialize } from 'express-openapi'

import dependencies from '../services/web'

import Config from '../config'

import { getSwaggerDocument } from '../lib/swagger'
import operation_to_handler from '../lib/operation_to_handler'
import operations from '../handlers/http'

import middlewares from '../services/middlewares'

const swaggerDoc = getSwaggerDocument(
  path.join(__dirname, '../swagger.yml')
)

let app = express()

app.use(async (req, res, next) => {
  req.locals = {
    startTime: new Date()
  }
  next()
})

app.use((req, res, next) => {
  next()
})

const injector = dependencies(Config, {})

middlewares(app, {
  config: Config,
  spec: swaggerDoc,
  services: injector({}, {})
})

const handlers = Object.entries(operations)
  .map(([operationId, operation]) => {
    return operation_to_handler(operationId, operation, injector)
  }).reduce((accumulator, current) => {
    accumulator[current[1]] = current[0]
    return accumulator
  }, {})

initialize({
  app,
  apiDoc: swaggerDoc,
  operations: handlers,
  consumesMiddleware: {
    'application/json': bodyParser.json(),
    'application/x-www-form-urlencoded': bodyParser.urlencoded(),
    'application/octet-stream': function(req, res, next) {
      multer().any()(req, res, function(err) {
        console.log(err)
        return next()
      })
    }
  }
})

app.server = http.createServer(app)
app.server.listen(Config.port, () => {
  console.log(`started listening on port ${Config.port}`)
})

export default app
