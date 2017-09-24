const WebSocketServer = require('websocket').server
const Stream = require('./stream')
const { EventEmitter } = require('events')

class SockPipe extends EventEmitter {
  constructor(options) {
    super()

    this.httpServer = options.httpServer
    this.isOriginAllowed = options.isOriginAllowed || (() => true)
    this.input = new Stream()
    this.output = new Stream()
  }

  start() {
    const ws = new WebSocketServer({
      httpServer: this.httpServer,
      autoAcceptConnections: false,
    })

    this.emit('open', this.input, this.output)

    ws.on('request', (request) => {
      if (!this.isOriginAllowed(request.origin)) {
        request.reject()
        this.emit('error', { message: `Origin not allowed: ${request.origin}` })
        return
      }

      var connection = request.accept('echo-protocol', request.origin)
      this.emit('connect')

      connection.on('message', (message) => {
        if (message.type === 'utf8') {
          this.input.push(message.utf8Data)
        }
      })

      this.output.on('data', chunk => connection.sendUTF(chunk))
    })
  }
}

module.exports = SockPipe
