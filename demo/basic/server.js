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
const messages$ = new Subject()
const alertMessages$ = new Subject()

const sockpipeServer = sockpipe({
    httpServer: server,
    debug: false
  },
  (msg$) => {
    const socketID = uuid()
    users[socketID] = {}

    msg$.finally(connectionCloseHandler(socketID))
      .subscribe(_.identity)

    const route = createRouter(msg$)

    return [
      route('signin', signinHandler(socketID)),
      route('message', messageHandler(socketID)),
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
    const user = users[socketID]
    if (user) {
      alertMessages$.next(`${user.username} left the room.`)

      delete users[socketID]
    }
  }
}

const signinHandler = (socketID) =>
  (data$) => data$
    .map(signin(socketID))

const signin = (socketID) =>
  (username) => {
    if (isUsernameAlreadyTaken(username)) {
      return {
        success: false,
        message: 'Username is already taken. Please choose another one.'
      }
    }

    const token = uuid()
    const userID = uuid()
    users[socketID] = {
      userID: userID,
      username: username,
      token: token,
    }

    alertMessages$.next(`${username} entered the room.`)

    return {
      success: true,
      token: token,
      userID: userID
    }
  }

const isUsernameAlreadyTaken = (username) =>
  _.some(users, {username: username})

const messageHandler = (socketID) =>
 (data$) => {
    data$
      .filter(data => data.message && data.token)
      .filter(data => data.token === users[socketID].token)
      .map(data => ({
        message: data.message,
        userID: users[socketID].userID,
        username: users[socketID].username,
        datetime: new Date()
      }))
      .subscribe(messages$)

    return messages$
  }
