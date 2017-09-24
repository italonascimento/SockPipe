"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var websocket_1 = require("websocket");
var events_1 = require("events");
var rxjs_1 = require("rxjs");
var SockPipe = (function (_super) {
    __extends(SockPipe, _super);
    function SockPipe(options) {
        var _this = _super.call(this) || this;
        _this.isOriginAllowed = function () { return true; };
        _this.inputSubject = new rxjs_1.Subject();
        _this.httpServer = options.httpServer;
        if (options.isOriginAllowed) {
            _this.isOriginAllowed = options.isOriginAllowed;
        }
        _this.input$ = _this.inputSubject.asObservable();
        _this.sendOutput(options.open(_this.input$));
        return _this;
    }
    SockPipe.prototype.start = function () {
        var _this = this;
        new websocket_1.server({
            httpServer: this.httpServer,
            autoAcceptConnections: false
        })
            .on('request', function (request) {
            if (!_this.isOriginAllowed(request.origin)) {
                request.reject();
                _this.emit('error', { message: "Origin not allowed: " + request.origin });
                return;
            }
            _this.connection = request.accept('echo-protocol', request.origin);
            _this.emit('connect');
            _this.connection.on('message', function (message) {
                if (message.type === 'utf8' && message.utf8Data) {
                    _this.inputSubject.next(JSON.parse(message.utf8Data));
                }
            });
        });
    };
    SockPipe.prototype.sendOutput = function (output) {
        var _this = this;
        rxjs_1.Observable
            .merge.apply(rxjs_1.Observable, output).subscribe(function (a) { return _this.connection.sendUTF(a); });
    };
    return SockPipe;
}(events_1.EventEmitter));
exports.SockPipe = SockPipe;
//# sourceMappingURL=sockpipe.js.map