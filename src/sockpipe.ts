import { server as WebSocketServer } from 'websocket'
import { EventEmitter } from 'events'
import { Subject, Observable } from 'rxjs'
import { IServerConfig, connection } from 'websocket'
import * as http from 'http'

export interface SockPipeConfig  {
  httpServer: http.Server,
  open: (msg: Observable<string>) => Observable<string>[]
  isOriginAllowed?: (origin: string) => boolean
}

export class SockPipe extends EventEmitter {

  private httpServer: http.Server
  private isOriginAllowed: (origin: string) => boolean = () => true
  private inputSubject: Subject<string> = new Subject()
  private input$: Observable<string>
  private connection: connection

  constructor(options: SockPipeConfig) {
    super()

    this.httpServer = options.httpServer

    if (options.isOriginAllowed) {
      this.isOriginAllowed = options.isOriginAllowed
    }

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
          if (message.type === 'utf8' && message.utf8Data) {
            this.inputSubject.next(JSON.parse(message.utf8Data))
          }
        })
      })
  }

  sendOutput(output: Observable<string>[]) {
    Observable
      .merge(...output)
      .subscribe((a: string ) => this.connection.sendUTF(a))
  }
}
