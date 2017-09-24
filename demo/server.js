const http = require('http')
const SockPipe = require('../src/sockpipe')
const fs = require('fs')
const index = fs.readFileSync('index.html')

const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/html'})
  res.end(index)
})
server.listen(8080)

const sockpipe = new SockPipe({
  httpServer: server,
})

sockpipe.on('open', (input, output) => {
  input
    .send(process.stdout)
    .mapTo('success')
    .send(output)
})

sockpipe.start()
