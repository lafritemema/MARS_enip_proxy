"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnipClient = void 0;
// import * as udp from 'dgram';
const events_1 = require("events");
const cip = __importStar(require("../../cip"));
const enip_1 = __importStar(require("../../enip")), enip = enip_1;
const proxy_error_1 = require("../proxy_error");
const node_cache_1 = __importDefault(require("node-cache"));
const tcp_client_1 = require("./tcp_client");
/**
 * Class describing an enip client
 */
class EnipClient extends events_1.EventEmitter {
    /**
     * EnipClient instance constructor
     * @param {string} ip host to connect
     * @param {number} port listening port
     * @param {DataHandler} dataHandler custom data DataHandler
     */
    constructor(ip, port = 44818, dataHandler) {
        super();
        this._tcpClient = new tcp_client_1.TcpClient();
        this._cache = new node_cache_1.default();
        this._targetIp = ip;
        this._targetPort = port;
        this._enipSession = null;
        this._dataHandler = dataHandler;
        this.configureHandler();
    }
    /**
     * tcpIp connection
     */
    connect() {
        this._tcpClient.connect(this._targetPort, this._targetIp);
    }
    /**
     * register a session
     */
    registerSession() {
        const enipHeader = enip.header.buildRegSession();
        const enipData = new enip.data.RegisterSession();
        const enipMessage = new enip_1.default(enipHeader, enipData);
        this._cache.set('session', {
            usageType: 'standard',
        });
        this._tcpClient.send(enipMessage.encode(), 'session');
    }
    /**
     * Configure the tcpclient handler
     */
    configureHandler() {
        // handler for TcpClient tcpdata event
        this._tcpClient.on('tcpdata', (tcpData, requestId) => {
            const cpacket = this._cache.get(requestId);
            const enipMsg = enip_1.default.parse(tcpData);
            let data;
            // if enipMessage status state (enip header status) = true => success
            if (enipMsg.isSuccess) {
                // if there is a body in EnipMessage => cip message
                if (enipMsg.hasBody) {
                    switch (enipMsg.command) {
                        case 'SendRRData':
                            const enipbody = enipMsg.body;
                            console.log(enipbody.data);
                            data = enipbody.data ?
                                this._dataHandler.parse(enipbody.data, cpacket.responseType) :
                                undefined;
                            break;
                        case 'ListIdentity':
                            data = enipMsg.body;
                            break;
                    }
                }
                this.emit(requestId, { command: enipMsg.command,
                    session: enipMsg.session,
                    data: data });
            }
            else {
                // default on enip request
                // eslint-disable-next-line max-len
                this.emit('failure', new proxy_error_1.TargetProtocolError('ERR_PROTOCOL_ENIP', 'ERROR: ENIP message transmission failure'));
            }
            if (cpacket.usageType == 'standard') {
                this._cache.del(requestId);
            }
        });
        // handler for socket connect event
        this._tcpClient.on('connect', () => {
            this.registerSession();
            this.emit('connect');
        });
        // handler for socket end event
        this._tcpClient.on('end', () => {
            this.emit('end');
        });
        // handler for error socket event
        this._tcpClient.on('error', (error) => {
            this.emit('error', error);
        });
        // handler for custom enipSession event
        this.on('session', (data) => {
            this._enipSession = data.session;
        });
    }
    /**
   * Build an UnConnected EnipMessage
   * @param {EnipRemoteMessageReq} requestMsg object describing the request to send
   * @return {EnipMessage} an EnipMessage instance
   */
    buildUCEnipMessage(requestMsg) {
        // define epath
        const epath = buildLogicalEpath(requestMsg.epath);
        const dataBuffer = requestMsg.data ?
            this._dataHandler.encode(requestMsg.data) :
            undefined;
        const reqMessage = new cip.message.Request(cip.message.Service[requestMsg.service], epath, dataBuffer);
        const addressItem = enip.data.item.buildNullAddressItem();
        const dataItem = enip.data.item.buildUnconnectedDataItem(reqMessage);
        const cpf = new enip.data.CPF(addressItem, dataItem);
        const enipData = new enip.data.SendRR(cpf);
        // eslint-disable-next-line max-len
        const enipHeader = enip.header.buildSendRR(this._enipSession, enipData.length);
        const enipMessage = new enip_1.default(enipHeader, enipData);
        return enipMessage;
    }
    /**
     * send enip unconnected message
     * @param {string} requestId id of unconnected request
     * @param {EnipRemoteMessage} enipRemoteMsg object describing the message to send
     */
    sendUnconnectedMsg(requestId, enipRemoteMsg) {
        if (!this._enipSession) {
            // eslint-disable-next-line max-len
            this.emit('failure', new Error('No session open for enip communication.'));
        }
        else {
            const requestMsg = enipRemoteMsg.request;
            const responseMsg = enipRemoteMsg.response ?
                enipRemoteMsg.response :
                undefined;
            let responseType;
            if (responseMsg) {
                responseType = responseMsg.items ?
                    responseMsg.items.type :
                    responseMsg.type;
            }
            else {
                responseType = undefined;
            }
            try {
                // build the enip message
                const enipMessage = this.buildUCEnipMessage(requestMsg);
                // store <requestId> : <responseType> in cache
                this._cache.set(requestId, { responseType: responseType,
                    usageType: 'standard' });
                // send message using TcpClient instance
                this._tcpClient.send(enipMessage.encode(), requestId);
            }
            catch (error) {
                this.emit('failure', error);
            }
        }
    }
    /**
     * initialize a tracker for a remote service
     * @param {string} requestId tracker request id
     * @param {EnipRemoteMessage} enipRemoteMsg object describing the message to send
     * @param {number} trackInterval time interval between each tracking request
     */
    initTracker(requestId, enipRemoteMsg, trackInterval) {
        // TODO implement new tcp write on inittracker
        if (!this._enipSession) {
            // eslint-disable-next-line max-len
            this.emit('failure', new Error('No session open for enip communication.'));
        }
        else {
            const requestMsg = enipRemoteMsg.request;
            const responseMsg = enipRemoteMsg.response;
            const responseType = responseMsg.items ?
                responseMsg.items.type :
                responseMsg.type;
            try {
                const enipMessage = this.buildUCEnipMessage(requestMsg);
                this._cache.set(requestId, {
                    responseType: responseType,
                    usageType: 'tracker',
                    timer: 'running'
                });
                const timer = setInterval((self, enipBuffer) => {
                    switch (self._cache.get(requestId).timer) {
                        case 'running':
                            self._tcpClient.send(enipBuffer, requestId);
                            break;
                        case 'clear':
                            clearInterval(timer);
                            this._cache.del(requestId);
                            break;
                    }
                }, trackInterval, this, enipMessage.encode());
                timer.unref();
                timer.ref();
            }
            catch (error) {
                this.emit('failure', error);
            }
        }
    }
    /**
     * clear a tracker
     * @param {string} requestId tracker request id
     */
    clearTracker(requestId) {
        // change the cache packet timer status
        this._cache.set(requestId, { timer: 'clear' });
        this.removeAllListeners(requestId);
    }
}
exports.EnipClient = EnipClient;
/**
 * build a logical epath object
 * @param {CipEpath}epathMsg opbject describing epath
 * @return {Epath} cip Epath instance
 */
function buildLogicalEpath(epathMsg) {
    const pathArray = [];
    const classSeg = new cip.epath.segment.Logical(cip.epath.segment.logical.Type.CLASS_ID, cip.epath.segment.logical.Format[epathMsg.class.type], epathMsg.class.value);
    pathArray.push(classSeg);
    const instanceSeg = new cip.epath.segment.Logical(cip.epath.segment.logical.Type.INSTANCE_ID, 
    // eslint-disable-next-line max-len
    cip.epath.segment.logical.Format[epathMsg.instance.type], epathMsg.instance.value);
    pathArray.push(instanceSeg);
    if (epathMsg.attribute) {
        const attributeSeg = new cip.epath.segment.Logical(cip.epath.segment.logical.Type.ATTRIBUTE_ID, 
        // eslint-disable-next-line max-len
        cip.epath.segment.logical.Format[epathMsg.attribute.type], epathMsg.attribute.value);
        pathArray.push(attributeSeg);
    }
    return new cip.EPath(pathArray);
}
