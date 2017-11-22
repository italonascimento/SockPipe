const http = require('http')
const { Observable, Subject } = require('rxjs')
const serveStatic = require('serve-static')
const finalhandler = require('finalhandler')
const uuid = require('uuid/v4')
const {
  sockpipe,
  createRouter
} = require('../../dist')

const serve = serveStatic(__dirname, { index: ['client.html'] })

const server = http.createServer((req, res) => {
  serve(req, res, finalhandler(req, res))
})
  .listen(8080)


const users = {}
const tokens = {}

const sockpipeServer = sockpipe({
    httpServer: server,
    debug: false
  },
  (msg$) => {
    const route = createRouter(msg$)

    return [
      route('signin', signinHandler),
      route('message', messageHandler)
    ]
  })
  .on('connect', () => console.log('[SockPipe] A client has connected'))
  .on('close', () => console.log('[SockPipe] A client has left'))

function signinHandler(data$) {
  return data$
    .map(signin)
}

function signin(username) {
  if (users[username]) {
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
  }
  tokens[username] = token

  return {
    success: true,
    token: token,
    userID: userID
  }
}

const messages$ = new Subject()

function messageHandler(data$) {
  data$
    .map(data => ({
      message: data.message,
      username: users[data.token],
      datetime: data.datetime
    }))
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