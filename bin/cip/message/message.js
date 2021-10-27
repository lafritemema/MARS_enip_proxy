"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseMessage = exports.RequestMessage = exports.Message = void 0;
const epath_1 = require("../epath/epath");
const message_type_1 = require("./message_type");
const message_service_1 = require("./message_service");
const response_status_1 = require("./response_status");
const utils_1 = require("../../utils");
/**
 * abstract class describing a CIP message
 * @class Message
 */
class Message {
    /**
     * Message object constructor
     * @param {number} type type of message => REQUEST or RESPONSE
     * @param {number} service service used
     * @param {Buffer} data data to transfert
     */
    constructor(type, service, data = Buffer.alloc(0)) {
        message_type_1.checkTypeCode(type);
        message_service_1.checkServiceCode(service);
        this._type = type;
        this._service = service;
        this._data = data;
    }
    /**
     * get the message service code
     * @return {number} message service
     */
    get service() {
        return this._service;
    }
    /**
     * get the message type code
     * @return {number} message type
     */
    get type() {
        return this._type;
    }
    /**
     * Get the message data
     * @param {number} data message data
     */
    get data() {
        return this._data;
    }
    /**
     * get the message type
     * @return {string} message type ('RESPONSE' or 'REQUEST')
     */
    getType() {
        return message_type_1.MessageType[this._type];
    }
    /**
     * get the message service under string format
     * @return {string} message service
     */
    getService() {
        return message_service_1.MessageService[this._service];
    }
    /**
     * Parse the CIP message buffer
     * @param {Buffer} buffer buffer describing the cip message
     * @return {Message} a Message instance
     */
    static parse(buffer) {
        const type = message_type_1.extractType(buffer.readUInt8(0));
        const service = message_service_1.extractService(buffer.readUInt8(0));
        message_type_1.checkTypeCode(type);
        message_service_1.checkServiceCode(service);
        const dataBuffer = buffer.slice(1);
        if (type == message_type_1.MessageType.RESPONSE) {
            return ResponseMessage._parseResponse(service, dataBuffer);
        }
        else {
            return RequestMessage._parseRequest(service, dataBuffer);
        }
    }
}
exports.Message = Message;
/**
 * class describing a CIP request message
 * @class RequestMessage
 */
class RequestMessage extends Message {
    /**
     * Request message constructor
     * @param {number} service service used
     * @param {EPath} path object path
     * @param {Buffer} data buffer describing the data
     */
    constructor(service, path, data = Buffer.alloc(0)) {
        super(message_type_1.MessageType.REQUEST, service, data);
        this._path = path;
    }
    /**
       * get the message path
       * @return {EPath} the message path
       */
    get epath() {
        return this._path;
    }
    /**
     * Set the message path
     * @param {EPath} path message path
     */
    set epath(path) {
        this._path = path;
    }
    /**
     * Get the message lenght in byte
     * @return {number} message length in byte
     */
    get length() {
        return this._data.length + this._path.lenght + 2;
    }
    /**
     * Parse the request part of the CIP message buffer
     * @param {number} service message service code
     * @param {Buffer} requestBuffer buffer describing the cip message
     * @return {Message} a Message instance
     */
    static _parseRequest(service, requestBuffer) {
        // instanciate buffer iterator
        const buffIt = new utils_1.BufferIterator(requestBuffer);
        // get pathsize
        const pathSize = buffIt.next().value.readUInt8();
        // browse bufferIterator to extract information about epath
        const path = epath_1.EPath.parse(buffIt, pathSize);
        // get all next elements of buffer => data
        const data = buffIt.allNext().value;
        return new RequestMessage(service, path, data);
    }
    /**
     * Convert the request message instance to JSON
     * @return {object} a message JSON representation
     */
    toJSON() {
        return {
            type: message_type_1.MessageType[this._type],
            service: message_service_1.MessageService[this._service],
            path: this._path.toJSON(),
            data: this._data.toString('hex'),
        };
    }
    /**
     * Encode the RequestMessage instance in a Buffer
     * @return {Buffer} a buffer describing the RequestMessage instance
     */
    encode() {
        // encode a metaBuffer with service + path size
        const metaBuffer = Buffer.alloc(2);
        metaBuffer.writeUInt8(this._service, 0);
        metaBuffer.writeUInt8(this._path.pathSize, 1);
        // get the epath buffer
        const epathBuffer = this._path.encode();
        // return buffer with metadata + epath data + data
        return Buffer.concat([metaBuffer, epathBuffer, this._data]);
    }
}
exports.RequestMessage = RequestMessage;
/**
 * class describing a CIP response message
 * @class ResponseMessage
 */
class ResponseMessage extends Message {
    /**
     * Response message constructor
       * @param {number} service service used
       * @param {number} status status for response
       * @param {Buffer} data buffer describing the data
       * @param {Buffer} addStatus additionnal status buffer
       */
    constructor(service, status, data = Buffer.alloc(0), addStatus = Buffer.alloc(0)) {
        super(message_type_1.MessageType.RESPONSE, service, data);
        response_status_1.checkStatusCode(status);
        this._status = status;
        this._addStatus = addStatus;
    }
    /**
     * Get the message status code
     */
    get status() {
        return this._status;
    }
    /**
     * Get the message status under string format
     * @return {string} status message status
     */
    getStatus() {
        return response_status_1.ResponseStatus[this._status];
    }
    /**
     * return true if no error on cip message
     */
    get isSuccess() {
        return this._status == response_status_1.ResponseStatus.Success;
    }
    /**
     * Get the message lenght in byte
     * @return {number} message length in byte
     */
    get length() {
        return this._data.length + this._addStatus.length + 4;
    }
    /**
     * Parse the request part of the CIP message buffer
     * @param {number} service message service code
     * @param {Buffer} responseBuffer buffer describing the cip message
     * @return {Message} a Message instance
     */
    static _parseResponse(service, responseBuffer) {
        // const reserved = buffer.readUInt8(0); // reserved shall be 00
        const status = responseBuffer.readUInt8(1);
        const addStatusSize = responseBuffer.readUInt8(2);
        // if status = 0 => success ; else default
        if (status == 0) {
            let addStatus = undefined;
            let data = undefined;
            // ENHANCE : implement BufferIterator and tests addStatus
            if (responseBuffer.length > 3) {
                if (addStatusSize == 0) {
                    data = responseBuffer.slice(3);
                }
                else {
                    addStatus = responseBuffer.slice(3, 3 + (addStatusSize * 2) + 1);
                    if (responseBuffer.length > 3 + (addStatusSize * 2) + 1) {
                        data = responseBuffer.slice(3 + (addStatusSize * 2) + 1);
                    }
                }
            }
            return new ResponseMessage(service, status, data, addStatus);
        }
        else {
            return new ResponseMessage(service, status);
        }
    }
    /**
     * Convert the response message instance to JSON
     * @return {object} a message JSON representation
     */
    toJSON() {
        return {
            type: message_type_1.MessageType[this._type],
            service: message_service_1.MessageService[this._service],
            // @ts-ignore
            status: response_status_1.ResponseStatus[this._status],
            addStatus: this._addStatus.toString('hex'),
            data: this._data.toString('hex'),
        };
    }
    /**
     * Encode the ResponseMessage instance in a Buffer
     * @return {Buffer} a buffer describing the ResponseMessage instance
     */
    encode() {
        // encode metabuffer with service + reserved octet + status + size additionnal status
        // size 4 byte
        const metaBuffer = Buffer.alloc(4);
        // or operation to set the service first bit to 1 (response value);
        const serviceRespCode = this._service | 128;
        metaBuffer.writeUInt8(serviceRespCode, 0);
        metaBuffer.writeUInt8(this._status, 2);
        metaBuffer.writeUInt8(this._addStatus.length, 3);
        // return buffer with metadata + addstatus data + data
        return Buffer.concat([metaBuffer, this._addStatus, this._data]);
    }
}
exports.ResponseMessage = ResponseMessage;
