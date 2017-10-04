"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const websocket_1 = require("websocket");
const events_1 = require("events");
const rxjs_1 = require("rxjs");
function sockpipe(config, resolve) {
    const { httpServer, isOriginAllowed = () => true, debug = false, } = config;
    const emitter = new events_1.EventEmitter();
    const webSocketServer = new websocket_1.server({
        httpServer: httpServer,
        autoAcceptConnections: false,
    })
        .on('request', request => {
        if (!isOriginAllowed(request.origin)) {
            request.reject();
            return;
        }
        createConnection({
            socket: request.accept('echo-protocol', request.origin),
            resolve,
            debug,
        });
    });
    return emitter;
}
exports.sockpipe = sockpipe;
function createConnection(config) {
    const { socket, resolve, debug = false } = config;
    const inputSubject = new rxjs_1.Subject();
    const input$ = inputSubject.asObservable();
    const output = resolve(input$);
    const subscription = rxjs_1.Observable
        .merge(...output)
        .do((o) => {
        if (debug) {
            console.log('output:', o);
        }
    })
        .subscribe((a) => Buffer.isBuffer(a)
        ? socket.sendBytes(a)
        : socket.sendUTF(JSON.stringify(a)));
    socket.on('message', (message) => {
        const messageData = (message.type === 'utf8' && message.utf8Data && JSON.parse(message.utf8Data))
            ||
                (message.type === 'binary' && message.binaryData && message.binaryData);
        if (debug) {
            console.log('input:', messageData);
        }
        inputSubject.next(messageData);
    });
    socket.on('close', () => subscription.unsubscribe());
}
//# sourceMappingURL=sockpipe.js.map