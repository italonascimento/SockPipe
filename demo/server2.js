const http = require('http')
const { SockPipe } = require('../dist/sockpipe')
const fs = require('fs')
const index = fs.readFileSync('index.html')
const { Observable } = require('rxjs')

Observable.prototype.route = function(route, handle) {
  return handle(
    this.filter(msg => msg.type === route)
  )
}

Observable.prototype.write = function(stream) {
  if (stream.write) {
    return this.do(chunk => stream.write(chunk))
  }
}

const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/html'})
  res.end(index)
})
server.listen(8080)

new SockPipe({
  httpServer: server,
  debug: true,
  open: (message$) =>
    [
      message$.route('hello', helloRoute),
      message$.route('hello2', hello2Route),
      message$.mapTo('success')
    ]

})
  .start()

function helloRoute(msg$) {
  return msg$
    .map(JSON.stringify)
    .write(process.stdout)
    .mapTo('hello response')
}

function hello2Route(msg$) {
  return msg$.mapTo('hello2 response')
}
