const http = require('http')
const { Observable, Subject } = require('rxjs')
const serveStatic = require('serve-static')
const finalhandler = require('finalhandler')
const {
  sockpipe,
  createRouter
} = require('../../dist')

const serve = serveStatic(__dirname, { index: ['client.html'] })

const server = http.createServer((req, res) => {
  serve(req, res, finalhandler(req, res))
})
  .listen(8080)

const allMessages$ = new Subject()

const sockpipeServer = sockpipe({
    httpServer: server,
    debug: false
  },
  (msg$) => {
    // Send all clients messages to a common pool
    msg$.subscribe(v => allMessages$.next(v))

    const route = createRouter(allMessages$.asObservable())

    return [
      route('message', messageHandler)
    ]
  })
  .on('connect', () => console.log('[SockPipe] A client has connected'))
  .on('close', () => console.log('[SockPipe] A client has left'))

function messageHandler(msgData$) {
  return msgData$.map(v => v.toString())
}
