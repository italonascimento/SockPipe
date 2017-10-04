import { server as WebSocketServer, IServerConfig, connection, IMessage } from 'websocket'
import { EventEmitter } from 'events'
import { Subject, Observable, Subscription } from 'rxjs'
import * as http from 'http'

type Resolver = (msg: Observable<string | Buffer>) => Observable<string>[]

export interface SockPipeConfig  {
  httpServer: http.Server
  isOriginAllowed?: (origin: string) => boolean
  debug?: boolean
}

export interface ConnectionConfig {
  debug?: boolean
  socket: connection
  resolve: Resolver
}

export function sockpipe(config: SockPipeConfig, resolve: Resolver): EventEmitter {
  const {
    httpServer,
    isOriginAllowed = () => true,
    debug = false,
  } = config

  const emitter = new EventEmitter()

  const webSocketServer = new WebSocketServer({
    httpServer: httpServer,
    autoAcceptConnections: false,
  })
    .on('request', request => {
      if (!isOriginAllowed(request.origin)) {
        request.reject()
        return
      }

      createConnection({
        socket: request.accept('echo-protocol', request.origin),
        resolve,
        debug,
      })
    })

  return emitter
}

function createConnection(config: ConnectionConfig){
  const { socket, resolve, debug = false } = config

  const inputSubject: Subject<string | Buffer> = new Subject()
  const input$ = inputSubject.asObservable()
  const output = resolve(input$)

  const subscription = Observable
    .merge(...output)
    .do((o: any) => {
      if (debug) {
        console.log('output:', o)
      }
    })
    .subscribe((a: any ) =>
      Buffer.isBuffer(a)
        ? socket.sendBytes(a)
        : socket.sendUTF(JSON.stringify(a))
    )

  socket.on('message', (message: IMessage) => {
    const messageData =
      (message.type === 'utf8' && message.utf8Data && JSON.parse(message.utf8Data))
      ||
      (message.type === 'binary' && message.binaryData && message.binaryData)

    if (debug) {
      console.log('input:', messageData)
    }

    inputSubject.next(messageData)
  })

  socket.on('close', () => subscription.unsubscribe())
}
