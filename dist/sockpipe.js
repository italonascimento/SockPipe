"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const websocket_1 = require("websocket");
const events_1 = require("events");
const rxjs_1 = require("rxjs");
class SockPipe extends events_1.EventEmitter {
    constructor(options) {
        super();
        this.isOriginAllowed = () => true;
        this.inputSubject = new rxjs_1.Subject();
        this.httpServer = options.httpServer;
        if (options.isOriginAllowed) {
            this.isOriginAllowed = options.isOriginAllowed;
        }
        this.debug = options.debug;
        this.input$ = this.inputSubject.asObservable();
        this.sendOutput(options.open(this.input$));
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
            this.connection = request.accept('echo-protocol', request.origin);
            this.emit('connect');
            this.connection.on('message', (message) => {
                const messageData = (message.type === 'utf8' && message.utf8Data && JSON.parse(message.utf8Data))
                    ||
                        (message.type === 'utf8' && message.binaryData && message.binaryData);
                if (this.debug) {
                    console.log('input:', messageData);
                }
                this.inputSubject.next(messageData);
            });
        });
    }
    sendOutput(output) {
        rxjs_1.Observable
            .merge(...output)
            .do((o) => {
            if (this.debug) {
                console.log('output:', o);
            }
        })
            .subscribe((a) => Buffer.isBuffer(a)
            ? this.connection.sendBytes(a)
            : this.connection.sendUTF(JSON.stringify(a)));
    }
}
exports.SockPipe = SockPipe;
//# sourceMappingURL=sockpipe.js.map