"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TcpClient = void 0;
const net_1 = require("net");
/**
 * class describing a TcpClient
 */
class TcpClient extends net_1.Socket {
    /**
     * TcpClient instance constructor
     */
    constructor() {
        super();
        this._msgQueue = [];
        this._sockAvailable = true;
        this.configure();
    }
    /**
     * configure event handler
     */
    configure() {
        this.on('drain', this.drainEventHandler);
        this.on('writedata', this.writeDataEventHandler);
        this.on('data', this.dataEventHandler);
    }
    /**
     * function to handle socket drain event
     */
    drainEventHandler() {
        // switch socket available to false until data reception
        this._sockAvailable = false;
    }
    /**
     * function to handle custom writedata event
     */
    writeDataEventHandler() {
        // update the currentMsg = > get the first msg in queue
        this._currentMsg = this._msgQueue.shift();
        // write it on the socket
        this.write(this._currentMsg.data);
    }
    /**
    * function to handle socket data event
    * @param {Buffer} data data send by server
    */
    dataEventHandler(data) {
        // build a tcpMsg with same id as current
        this.emit('tcpdata', data, this._currentMsg.id);
        this._sockAvailable = true;
        if (this._msgQueue.length > 0) {
            this.emit('writedata');
        }
    }
    /**
     * send a message on the socket using the TCP protocol
     * @param {Buffer} data data to send on TCP connection stream
     * @param {string} reqId request id
     */
    send(data, reqId) {
        this._msgQueue.push({
            id: reqId,
            data: data,
        });
        if (this._sockAvailable) {
            this.emit('writedata');
        }
    }
}
exports.TcpClient = TcpClient;
