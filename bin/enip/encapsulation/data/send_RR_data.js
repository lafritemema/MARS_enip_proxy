"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendRRData = void 0;
const cpf_1 = require("./cpf");
/**
 * Class describe SendRRData command specific data
 */
class SendRRData {
    /**
     * SendRRData instance constructor
     * @param {EnipCPF} enipCpf EnipCPF object describing the data
     * @param {number} timeout enip protocol timeout in second, default 0
     * When in the range 1 to 65535, the timeout shall be set to this number of seconds.
     * When is set to 0, the enip protocol shall not have its own timeout, encapsulated protocol timeout used instead.
     */
    constructor(enipCpf, timeout = 0) {
        this._interfaceHandle = 0; // interface handle 0 for CIP
        this._timeout = timeout;
        this._enipCpf = enipCpf;
    }
    /**
     * Get the SendRRData length in bytes
     * @return {number} SendRRData length
     */
    get length() {
        return this._enipCpf.length + 6;
    }
    /**
     * return true if no error on cip message
     */
    get isSuccess() {
        // if the message is a response message
        const cipMsg = this._enipCpf.dataItem.message;
        if ((cipMsg === null || cipMsg === void 0 ? void 0 : cipMsg.getType()) == 'RESPONSE') {
            return cipMsg.isSuccess;
        }
        else {
            return true;
        }
    }
    /**
     * return true is the message has a body
     */
    get hasBody() {
        // sendrrdata message always have a body
        return true;
    }
    /**
     * get the body (essential informations) of the element
     */
    get body() {
        const body = {
            itemType: this._enipCpf.dataItem.getType(),
            messageType: this._enipCpf.dataItem.message.getType(),
            service: this._enipCpf.dataItem.message.getService(),
        };
        // if a message and the message data buffer is not empty
        if (this._enipCpf.dataItem.message &&
            this._enipCpf.dataItem.message.data.length > 0) {
            // get the message data
            body.data = this._enipCpf.dataItem.message.data;
        }
        if (body.messageType == 'RESPONSE') {
            body.messageStatus = this._enipCpf.
                dataItem
                .message.getStatus();
        }
        return body;
    }
    /**
     * Parse a buffer describing the SendRR encapsulated data
     * @param {Buffer} sendRRBuff buffer describing SendRR encapsulated data
     * @return {SendRRData} a SendRRData instance
     */
    static parse(sendRRBuff) {
        const interfaceHandle = sendRRBuff.readUInt32LE(0);
        checkInterfaceHandle(interfaceHandle);
        const timeout = sendRRBuff.readUInt16LE(4);
        const cpfBuff = sendRRBuff.slice(6);
        const cpf = cpf_1.EnipCPF.parse(cpfBuff);
        return new SendRRData(cpf, timeout);
    }
    /**
     * Encode the SendRRData instance to Buffer
     * @return {Buffer} datagram describing the SendRRData
     */
    encode() {
        const metaBuff = Buffer.alloc(6);
        metaBuff.writeInt32LE(this._interfaceHandle, 0);
        metaBuff.writeUInt16LE(this._timeout, 4);
        const cpfBuff = this._enipCpf.encode();
        return Buffer.concat([metaBuff, cpfBuff]);
    }
    /**
     * Convert the SendRRData instance to JSON
     * @return {object} a SendRRData JSON representation
     */
    toJSON() {
        return {
            interfaceHandle: this._interfaceHandle,
            timeout: this._timeout,
            enipCpf: this._enipCpf.toJSON(),
        };
    }
}
exports.SendRRData = SendRRData;
/**
 * Check if the interface handle code in conform
 * @param {number} intHandle interface handle code
 */
function checkInterfaceHandle(intHandle) {
    if (intHandle != 0) {
        // eslint-disable-next-line max-len
        throw new Error(`ERROR : The CPF packet interface handle must be 0 for CIP protocol instead of ${intHandle}.`);
    }
}
