"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const websocket_1 = require("websocket");
const events_1 = require("events");
const rxjs_1 = require("rxjs");
class Connection {
    constructor(config) {
        this.inputSubject = new rxjs_1.Subject();
        this.input$ = this.inputSubject.asObservable();
        this.debug = Boolean(config.debug);
        this.socket = config.socket;
        this.socket.on('message', this.handleMessage.bind(this));
        this.socket.on('close', this.destroy.bind(this));
        this.sendOutput(config.resolver(this.input$));
    }
    handleMessage(message) {
        const messageData = (message.type === 'utf8' && message.utf8Data && JSON.parse(message.utf8Data))
            ||
                (message.type === 'binary' && message.binaryData && message.binaryData);
        if (this.debug) {
            console.log('input:', messageData);
        }
        this.inputSubject.next(messageData);
    }
    sendOutput(output) {
        this.subscription = rxjs_1.Observable
            .merge(...output)
            .do((o) => {
            if (this.debug) {
                console.log('output:', o);
            }
        })
            .subscribe((a) => Buffer.isBuffer(a)
            ? this.socket.sendBytes(a)
            : this.socket.sendUTF(JSON.stringify(a)));
    }
    destroy() {
        this.subscription.unsubscribe();
    }
}
exports.Connection = Connection;
class SockPipe extends events_1.EventEmitter {
    constructor(config) {
        super();
        this.isOriginAllowed = () => true;
        this.httpServer = config.httpServer;
        if (config.isOriginAllowed) {
            this.isOriginAllowed = config.isOriginAllowed;
        }
        this.debug = Boolean(config.debug);
        this.resolver = config.resolver;
    }
    start() {
        new websocket_1.server({
            httpServer: this.httpServer,
            autoAcceptConnections: false,
        })
            .on('request', (request) => {
            if (!this.isOriginAllowed(request.origin)) {
                request.reject();
                this.emit('error', { message: `Origin not allowed: ${request.origin}` });
                return;
            }
            const connection = new Connection({
                socket: request.accept('echo-protocol', request.origin),
                resolver: this.resolver,
                debug: this.debug,
            });
            this.emit('connect');
        });
    }
}
exports.SockPipe = SockPipe;
//# sourceMappingURL=sockpipe.js.map