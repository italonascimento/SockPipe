const WebSocketServer = require('websocket').server
const { EventEmitter } = require('events')
const Rx = require('rxjs')


class SockPipe extends EventEmitter {

  constructor(options) {
    super()

    this.httpServer = options.httpServer
    this.isOriginAllowed = options.isOriginAllowed || (() => true)

    this._inputEvent = new Rx.Subject()
    this.input = this._inputEvent.asObservable()

    this.sendOutput(
      options.open(this.input)
    )
  }

  start() {
    new WebSocketServer({
      httpServer: this.httpServer,
      autoAcceptConnections: false,
    })
      .on('request', (request) => {
        if (!this.isOriginAllowed(request.origin)) {
          request.reject()
          this.emit('error', { message: `Origin not allowed: ${request.origin}` })
          return
        }

        this.connection = request.accept('echo-protocol', request.origin)
        this.emit('connect')

        this.connection.on('message', (message) => {
          if (message.type === 'utf8') {
            this._inputEvent.next(JSON.parse(message.utf8Data))
          }
        })
      })
  }

  sendOutput(output) {
    Rx.Observable
      .merge(...output)
      .subscribe(a => this.connection.sendUTF(a))
  }
}

module.exports = SockPipe
