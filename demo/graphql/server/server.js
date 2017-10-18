const http = require('http')
const path = require('path')
const { Subject } = require('rxjs')
const serveStatic = require('serve-static')
const finalhandler = require('finalhandler')
const {
  sockpipe,
  createRouter,
  createGraphQLHandler,
  createSubscriptionHandler,
} = require('../../../dist')
const graphqlEvents$ = require('./graphql').events
const { schema, root } = require('./graphql')

const serve = serveStatic(path.join(__dirname, '../client'), {'index': ['index.html']})

const server = http.createServer((req, res) => {
  serve(req, res, finalhandler(req, res))
})
  .listen(8080)


const sockpipeServer = sockpipe({
    httpServer: server,
    debug: false
  },
  (msg$) => {
    const route = createRouter(msg$)
    const graphQLHandler = createGraphQLHandler(schema, root)

    return [
      route('graphql', graphQLHandler),
      route('subscription', createSubscriptionHandler(graphqlEvents$, graphQLHandler)),
    ]
  })
  .on('connect', () => console.log('[SockPipe] A client has connected'))
  .on('close', () => console.log('[SockPipe] A client has left'))
