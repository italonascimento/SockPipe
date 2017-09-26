const http = require('http')
const { SockPipe } = require('../dist/sockpipe')
const fs = require('fs')
const index = fs.readFileSync('index.html')
const { Observable } = require('rxjs')

const route = function(msg$, route, handle) {
  return handle(
    msg$.filter(msg => msg.type === route)
  )
}

const write = function(msg$, stream) {
  if (stream.write) {
    return msg$.do(chunk => stream.write(chunk))
  }

  return msg$
}

const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/html'})
  res.end(index)
})
server.listen(8080)

new SockPipe({
  httpServer: server,
  debug: true,
  open: (msg$) =>
    [
      route(msg$, 'query', queryHandler),
      route(msg$, 'mutation', mutationHandle),
    ]
})
  .start()

function queryHandler(msg$) {
  return msg$
}

function mutationHandle(msg$) {
  return msg$
}
