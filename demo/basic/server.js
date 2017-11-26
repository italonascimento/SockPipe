const http = require('http')
const path = require('path')
const serveStatic = require('serve-static')
const finalhandler = require('finalhandler')
const { Observable, Subject } = require('rxjs')
const uuid = require('uuid/v4')
const _ = require('lodash')
const {
  sockpipe,
  createRouter
} = require('../../dist')

const serve = serveStatic(path.join(__dirname, 'client'), { index: ['index.html'] })

const server = http.createServer((req, res) => {
  serve(req, res, finalhandler(req, res))
})
  .listen(8080)


const users = {}
const tokens = {}
const sockets = {}

const messages$ = new Subject()
const alertMessages$ = new Subject()

const sockpipeServer = sockpipe({
    httpServer: server,
    debug: false
  },
  (msg$) => {
    const socketID = uuid()
    sockets[socketID] = msg$

    msg$.finally(connectionCloseHandler(socketID))
      .subscribe(_.identity)

    const route = createRouter(msg$)

    return [
      route('signin', signinHandler(socketID)),
      route('message', messageHandler),
      alertMessages$.map(alert => ({
        type: 'alert',
        data: alert,
      })),
    ]
  })
  .on('connect', () => console.log('[SockPipe] A client has connected'))
  .on('close', () => console.log('[SockPipe] A client has left'))

function connectionCloseHandler(socketID) {
  return function() {
    const token = _.findKey(users, (user) => user.socketID === socketID)
    if (token) {
      const username = users[token].username
      users[token] = undefined
      tokens[username] = undefined

      alertMessages$.next(`${username} left the room.`)
    }
  }
}

function signinHandler(socketID) {
  return function signinHandler(data$) {
    return data$
    .map(signin(socketID))
  }
}

function signin(socketID) {
  return function (username) {
    if (tokens[username]) {
      return {
        success: false,
        message: 'Username is already taken. Please choose another one.'
      }
    }

    const token = uuid()
    const userID = uuid()
    users[token] = {
      id: userID,
      username: username,
      socketID: socketID,
    }

    tokens[username] = token

    alertMessages$.next(`${username} entered the room.`)

    return {
      success: true,
      token: token,
      userID: userID
    }
  }
}


function messageHandler(data$) {
  data$
    .filter(data => data.message && data.token)
    .filter(data => users[data.token])
    .map(data => ({
      message: data.message,
      userID: users[data.token].id,
      username: users[data.token].username,
      datetime: new Date()
    }))
    .subscribe(messages$)

  return messages$
}
