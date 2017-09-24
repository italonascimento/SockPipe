const http = require('http')
const SockPipe = require('../src/sockpipe')
const fs = require('fs')
const index = fs.readFileSync('index.html')


const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/html'})
  res.end(index)
})
server.listen(8080)


const mapByType$ = (message$, type, response) =>
  message$
    .filter(message => message.type === type)
    .mapTo(response)

const mapToPayload$ = (message$) =>
  message$
    .filter(message => message.type === 'payload')
    .map(message => message.payload)

const mapAll$ = (message$) =>
  message$
    .mapTo('all messages gotta receive this')


new SockPipe({
  httpServer: server,
  open: (message$) =>
    [
      mapByType$(message$, 'hello', 'success'),
      mapByType$(message$, 'hello2', 'success2'),
      mapToPayload$(message$),
      mapAll$(message$),
    ]

})
    .start()
