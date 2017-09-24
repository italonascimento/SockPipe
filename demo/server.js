const http = require('http')
const SockPipe = require('../src/sockpipe')
const fs = require('fs')
const index = fs.readFileSync('index.html')
const Rx = require('rxjs')


const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/html'})
  res.end(index)
})
server.listen(8080)

console.log(Rx.Node)


new SockPipe({
  httpServer: server,
  open: (message$) =>
    [
      message$
        .filter(message => message.type === 'hello')
        .mapTo('success')
      ,
      message$
        .filter(message => message.type === 'hello2')
        .mapTo('success 2')
      ,
    ]

})
    .start()
