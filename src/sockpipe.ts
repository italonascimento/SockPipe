import { server as WebSocketServer, IServerConfig, connection, IMessage } from 'websocket'
import { EventEmitter } from 'events'
import { Subject, Observable, Subscription } from 'rxjs'
import * as http from 'http'

export type Resolver = (msg: Observable<Message>) => Observable<Message>[]

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

export interface Message{
  type: string
  data?: any
}

export default function(config: SockPipeConfig, resolve: Resolver): EventEmitter {
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
        emitter.emit('error', {message: `Origin not allowed: ${request.origin}`})
        return
      }

      const connection = createConnection({
        socket: request.accept('echo-protocol', request.origin),
        resolve,
        debug,
      })
    })
    .on('connect', () => emitter.emit('connect'))
    .on('close', () => emitter.emit('close'))

  return emitter
}

function createConnection(config: ConnectionConfig){
  const { socket, resolve, debug = false } = config

  const inputSubject: Subject<Message> = new Subject()
  const input$ = inputSubject.asObservable()
  const output = resolve(input$)
  const accept: string[] = []

  const subscription = Observable
    .merge(...output)
    .filter(msg => !!msg.type && accept.includes(msg.type))
    .do((o: any) => {
      if (debug) {
        console.log('output:', o)
      }
    })
    .subscribe((a: any ) =>
      Buffer.isBuffer(a.data)
        ? socket.sendBytes(a.data)
        : socket.sendUTF(JSON.stringify(a))
    )

  socket.on('message', (message: IMessage) => {
    const messageData: Message =
      (message.type === 'utf8' && message.utf8Data && JSON.parse(message.utf8Data))
      ||
      (message.type === 'binary' && message.binaryData && message.binaryData)

    if (debug) {
      console.log('input:', messageData)
    }

    if (messageData.type && messageData.type === 'accept') {
      if (messageData.data && Array.isArray(messageData.data)) {
        messageData.data.forEach((value: any) => accept.push(value.toString()))
      }
    } else {
      inputSubject.next(messageData)
    }
  })

  socket.on('close', () => subscription.unsubscribe())
}
