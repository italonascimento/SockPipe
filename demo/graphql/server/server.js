const http = require('http')
const fs = require('fs')
const path = require('path')
const { Subject } = require('rxjs')
const serveStatic = require('serve-static')
const finalhandler = require('finalhandler')
const { sockpipe } = require('../../../dist/sockpipe')
const {
  queryHandler,
  mutationHandler,
  subscribeHandler
} = require('./message-handlers.js')

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
    const fakeEvent$ = new Subject()

    let i = 0
    const interval = setInterval(() => {
      if (i == 9) {
        clearInterval(interval)
      }
      fakeEvent$.next()
      i += 1
    }, 1000)

    return [
      route(msg$, 'query', queryHandler),
      route(msg$, 'mutation', mutationHandler),
      route(msg$, 'subscribe', subscribeHandler(fakeEvent$)),
      fakeEvent$.mapTo('test')
    ]
  })
  .on('connect', () => console.log('[SockPipe] A client has connected'))
  .on('close', () => console.log('[SockPipe] A client has left'))


function route(msg$, route, handle) {
  return handle(
    msg$
    .filter(msg => msg.type === route)
    .map(msg => msg.data)
  )
}