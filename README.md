# SockPipe

SockPipe is a Node.js framework for development of websocket servers with use
of reactive programming.

### Basic helloworld, echo and ping server

```js
const http = require('http')
const { sockpipe } = require('sockpipe')

const server = http.createServer((req, res) => {
  console.log('Received request for ' + request.url);
  response.writeHead(404);
  response.end();
})
.listen(8080)

const sockpipeServer = sockpipe({
  httpServer: server,
  debug: true
}, (msg$) => [

  // Any message of type 'greetings' will be responded
  // with a 'Hello World'
  msg$.filter(msg => msg.type === 'greetings')
    .mapTo({
      type: 'greetings',
      data: 'Hello World'
    }),

  // Any message of type 'echo' will be sent back
  // exactly the same
  msg$.filter(msg => msg.type === 'echo'),

  // Each one second the server will send a message
  // of type 'ping' to it's clients
  Observable.interval(1000)
    .mapTo({
      type: 'ping',
    })
])
.on('connect', () => console.log('[SockPipe] A client has connected'))
.on('close', () => console.log('[SockPipe] A client has left'))
```

### Routing messages by type

To simplify the rounting of messages by type, you may use the helper function
`createRouter`:

```js
const http = require('http')
const { sockpipe, createRouter } = require('sockpipe')

const server = http.createServer((req, res) => {
  serve(req, res, finalhandler(req, res))
})
.listen(8080)

const sockpipeServer = sockpipe({
  httpServer: server,
}, (msg$) => [
  const route = createRouter(msg$)

  // The callback receives an Observable of the message 'data' alone
  // and doesn't need to worry about returning the 'type' either.
  route('greetings', greetingsHandler)
])

function greetingsHandler(msgData$) {
  return msgData$.mapTo({ data: 'Hello World' })
}
```

## Demos

For more useful exemples, such as GraphQL and authentication, check the demos
folder:

https://github.com/italonascimento/SockPipe/tree/master/demo
