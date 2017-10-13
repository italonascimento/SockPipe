const http = require('http')
const fs = require('fs')
const path = require('path')
const { Subject } = require('rxjs')
const serveStatic = require('serve-static')
const finalhandler = require('finalhandler')
const { sockpipe, route } = require('../../../dist')
const {
  graphQLHandler,
  subscriptionHandler
} = require('./message-handlers.js')
const { update$ } = require('./graphql')

const serve = serveStatic(path.join(__dirname, '../client'), {'index': ['index.html']})

const server = http.createServer((req, res) => {
  serve(req, res, finalhandler(req, res))
})
  .listen(8080)


const sockpipeServer = sockpipe({
    httpServer: server,
    debug: false
  },
  (msg$) => [
    route(msg$, 'graphql', graphQLHandler),
    route(msg$, 'subscription', subscriptionHandler),
  ])
  .on('connect', () => console.log('[SockPipe] A client has connected'))
  .on('close', () => console.log('[SockPipe] A client has left'))
