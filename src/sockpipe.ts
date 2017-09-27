import { server as WebSocketServer, IServerConfig, connection, IMessage } from 'websocket'
import { EventEmitter } from 'events'
import { Subject, Observable, Subscription } from 'rxjs'
import * as http from 'http'

type Resolver = (msg: Observable<string | Buffer>) => Observable<string>[]

export interface SockPipeConfig  {
  httpServer: http.Server
  resolver: Resolver
  isOriginAllowed?: (origin: string) => boolean
  debug?: boolean
}

export interface ConnectionConfig {
  debug?: boolean
  socket: connection
  resolver: Resolver
}

export class Connection {

  private inputSubject: Subject<string | Buffer>
  private input$: Observable<string | Buffer>
  private socket: connection
  private debug: boolean
  private subscription: Subscription

  constructor(config: ConnectionConfig) {
    this.inputSubject = new Subject()
    this.input$ = this.inputSubject.asObservable()
    this.debug = Boolean(config.debug)
    this.socket = config.socket

    this.socket.on('message', this.handleMessage.bind(this))
    this.socket.on('close', this.destroy.bind(this))

    this.sendOutput(config.resolver(this.input$))
  }

  private handleMessage(message: IMessage) {
    const messageData =
      (message.type === 'utf8' && message.utf8Data && JSON.parse(message.utf8Data))
      ||
      (message.type === 'binary' && message.binaryData && message.binaryData)

    if (this.debug) {
      console.log('input:', messageData)
    }

    this.inputSubject.next(messageData)
  }

  private sendOutput(output: Observable<any>[]) {
    this.subscription = Observable
      .merge(...output)
      .do((o: any) => {
        if (this.debug) {
          console.log('output:', o)
        }
      })
      .subscribe((a: any ) =>
        Buffer.isBuffer(a)
          ? this.socket.sendBytes(a)
          : this.socket.sendUTF(JSON.stringify(a))
      )
  }

  private destroy() {
    this.subscription.unsubscribe()
  }
}

export class SockPipe extends EventEmitter {

  private httpServer: http.Server
  private isOriginAllowed: (origin: string) => boolean = () => true
  private debug: boolean
  private resolver: Resolver

  constructor(config: SockPipeConfig) {
    super()

    this.httpServer = config.httpServer

    if (config.isOriginAllowed) {
      this.isOriginAllowed = config.isOriginAllowed
    }

    this.debug = Boolean(config.debug)
    this.resolver = config.resolver
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

        const connection = new Connection({
          socket: request.accept('echo-protocol', request.origin),
          resolver: this.resolver,
          debug: this.debug,
        })

        this.emit('connect')
      })
  }
}
