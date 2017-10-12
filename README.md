# SockPipe

SockPipe is a Node.js framework for reactive backend programming.

```js
const http = require('http')
const { sockpipe } = require('sockpipe')

const server = http.createServer((req, res) => {
  serve(req, res, finalhandler(req, res))
})
.listen(8080)

const sockpipeServer = sockpipe({
  httpServer: server,
  debug: false
}, (msg$) => [
  msg$.filter(msg => msg.type === 'TYPE_1')
    .mapTo({
      type: 'TYPE_1',
      data: 'Some static response for messages of type 1'
    }),

  msg$.filter(msg => msg.type === 'TYPE_2')
    .map(msg => ({
      type: 'TYPE_2',
      data: `Some dynamic response for messages of type 2 with payload: ${msg.data}`
    })),

  Observable.interval(1000)
    .mapTo({
      type: 'TYPE_3',
      data: 'Some annoying message which is sent to clients every second.'
    })
])
.on('connect', () => console.log('[SockPipe] A client has connected'))
.on('close', () => console.log('[SockPipe] A client has left'))
```
