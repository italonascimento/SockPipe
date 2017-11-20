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


const users = {
  taken: true
}

const sockpipeServer = sockpipe({
    httpServer: server,
    debug: false
  },
  (msg$) => {
    const route = createRouter(msg$)

    return [
      route('signin', signinHandler),
      // route('message', messageHandler)
    ]
  })
  .on('connect', () => console.log('[SockPipe] A client has connected'))
  .on('close', () => console.log('[SockPipe] A client has left'))

function signinHandler(data$) {
  return data$
    .map(signin)
}

function signin(username) {
  if (!users[username]) {
    users[username] = true
    return {
      success: true
    }
  }

  return {
    success: false,
    message: 'Username is already taken. Please choose another one.'
  }
}

function messageHandler(data$) {

}
