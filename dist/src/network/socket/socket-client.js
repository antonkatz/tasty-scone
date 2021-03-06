"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const IdDigest_1 = require("../IdDigest");
class NetworkStream {
    constructor(host, protocol, port, path) {
        this.host = host;
        this.protocol = protocol;
        this.port = port;
        this.path = path;
        this.socket = new rxjs_1.BehaviorSubject(null);
        this.socketio = null;
        this.isUnloading = false;
    }
    async connect() {
        console.debug('NetworkStream is connecting...');
        this.socketio = (await Promise.resolve().then(() => __importStar(require('socket.io-client'))).then()).default;
        this.openSocket();
        const _t = this;
        window.addEventListener('beforeunload', function () {
            console.debug('Closing socket in `beforeunload`');
            _t.isUnloading = true;
            _t.socket.toPromise().then(_ => _ && _.close()).then(_ => _t.isUnloading = false);
        });
    }
    openSocket() {
        const port = this.port ? `:${this.port}` : '';
        const url = `${this.protocol}//${this.host}${port}`;
        console.log(`NetworkStream opened socket on ${url} @ ${this.path}`);
        if (!this.socketio)
            throw new Error('Failed to load socketio client lib');
        const s = this.socketio(url, { transports: ['websocket'], path: this.path });
        const _t = this;
        s.on('disconnect', (reason) => {
            console.warn('Has disconnected because: ', reason);
            if (!_t.isUnloading)
                location.reload();
        });
        this.socket.next(s);
    }
    requestStream(opStream) {
        // todo make sure to ack
        console.debug('Request to server is waiting to be subscribed');
        return this.socket.pipe(operators_1.first(s => {
            console.debug('NetworkStream attempting to use socket', s && s.id);
            return !!s;
        }), operators_1.flatMap(_socket => {
            console.debug('.');
            const dehydratedStream = opStream.serialize();
            const socket = _socket;
            return IdDigest_1.ID_DIGEST(dehydratedStream).then(opId => {
                console.debug('Reqested network stream has id:', opId);
                console.debug('Dehydrated stream:', dehydratedStream);
                return { opId, socket, dehydratedStream };
            });
        }), operators_1.flatMap(({ opId, socket, dehydratedStream }) => {
            socket.emit('streamRequest', dehydratedStream);
            return rxjs_1.fromEvent(socket, opId).pipe(operators_1.tap((resp) => console.debug('Response on ', opId)));
        }));
    }
}
exports.default = NetworkStream;
