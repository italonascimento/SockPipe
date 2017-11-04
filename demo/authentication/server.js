const http = require('http')
const { Observable, Subject } = require('rxjs')
const serveStatic = require('serve-static')
const finalhandler = require('finalhandler')
const uuid = require('uuid/v4')
const {
  sockpipe,
  createRouter
} = require('../../dist')

const users = {
  test: {
    password: 'test'
  }
}
const loggedUsers = {}

const serve = serveStatic(__dirname, { index: ['index.html'] })

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

    return [
      route('auth', authHandler)
    ]
  })
  .on('connect', () => console.log('[SockPipe] A client has connected'))
  .on('close', () => console.log('[SockPipe] A client has left'))

function authHandler(msgData$) {
  console.log('authHandler')
  return msgData$.map(authenticateUser)
}

function authenticateUser(userData) {
  const user = users[userData.username]

  if (
    user
    && user.password === userData.password
  ) {
    if (user.token && loggedUsers[user.token] === user) {
      return {
        success: false,
        error: 'User is already logged',
      }
    } else {
      const token = uuid()
      user.token = token
      loggedUsers[token] = user
      return {
        success: true,
        token,
      }
    }
  }

  return {
    success: false,
    error: 'Invalid credentials',
  }
}
