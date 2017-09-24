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
    .map(message => {
        return {
            type: message.type,
            payload: response,
        }
    })

const mapAll$ = (message$) =>
  message$
    .mapTo('all messages gotta receive this')


new SockPipe({
  httpServer: server,
  debug: true,
  open: (message$) =>
    [
      mapByType$(message$, 'hello', {msg: 'success'}),
      mapByType$(message$, 'hello2', {msg: 'success2'}),
      mapAll$(message$),
    ]

})
  .start()
