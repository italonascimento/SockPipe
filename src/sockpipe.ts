import { server as WebSocketServer } from 'websocket'
import { EventEmitter } from 'events'
import { Subject, Observable } from 'rxjs'
import { IServerConfig, connection } from 'websocket'
import * as http from 'http'

export interface SockPipeConfig  {
  httpServer: http.Server
  open: (msg: Observable<string | Buffer>) => Observable<string>[]
  isOriginAllowed?: (origin: string) => boolean
  debug: boolean,
}

export class SockPipe extends EventEmitter {

  private httpServer: http.Server
  private isOriginAllowed: (origin: string) => boolean = () => true
  private inputSubject: Subject<string | Buffer> = new Subject()
  private input$: Observable<string | Buffer>
  private connection: connection
  private debug: boolean

  constructor(options: SockPipeConfig) {
    super()

    this.httpServer = options.httpServer

    if (options.isOriginAllowed) {
      this.isOriginAllowed = options.isOriginAllowed
    }

    this.debug = options.debug
    this.input$ = this.inputSubject.asObservable()

    this.sendOutput(
      options.open(this.input$)
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
          const messageData =
            (message.type === 'utf8' && message.utf8Data && JSON.parse(message.utf8Data))
            ||
            (message.type === 'utf8' && message.binaryData && message.binaryData)

          if (this.debug) {
            console.log('input:', messageData)
          }
          this.inputSubject.next(messageData)
        })
      })
  }

  private sendOutput(output: Observable<string | Buffer>[]) {
    Observable
      .merge(...output)
      .do(o => {
        if (this.debug) {
          console.log('output:', o)
        }
      })
      .map((a: any) => Buffer.isBuffer(a) ? a : JSON.stringify(a))
      .subscribe((a: string | Buffer ) => this.connection.sendUTF(a))
  }
}
