"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnipMessage = void 0;
const utils_1 = require("../utils");
const data_1 = require("./encapsulation/data");
const header_1 = __importDefault(require("./encapsulation/header"));
/**
 * Clas describing an ENIP packet
 */
class EnipMessage {
    /**
     * Enip instance constructor
     * @param {EnipHeader} enipHeader Enip encapsulated header
     * @param {EnipData} enipData Enip encapsulated data
     */
    constructor(enipHeader, enipData) {
        this._data = enipData ? enipData : undefined;
        this._header = enipHeader;
    }
    /**
     * Get communication session
     */
    get session() {
        return this._header.session;
    }
    /**
     * Get the status of request
     */
    get status() {
        return this._header.getStatus();
    }
    /**
     * Get the command of request
     */
    get command() {
        return this._header.getCommand();
    }
    // ENHANCE not very clean, to enhance
    /**
     * return true if no error on message
     */
    get isSuccess() {
        if (this._header.getStatus().state) {
            if (this._data) {
                return this._data.isSuccess;
            }
            else {
                return true;
            }
        }
        else {
            return false;
        }
    }
    /**
     * return true is the message has a body
     */
    get hasBody() {
        // list_identity message always have a body
        return this._data ? this._data.hasBody : false;
    }
    /**
     * Get the data message body
     * @return {ListIdentityBody|SendRRBody|undefined} message body
     */
    get body() {
        if (this._data instanceof data_1.ListIdentity) {
            return this._data.body;
        }
        else if (this._data instanceof data_1.SendRR) {
            return this._data.body;
        }
    }
    /**
     * Parse a buffer describing the Enip message
     * @param {Buffer} enipBuffer buffer describing the Enip packet
     * @return {Enip} a Enip instance
     */
    static parse(enipBuffer) {
        const buffIt = new utils_1.BufferIterator(enipBuffer);
        const headerBuff = buffIt.next(24).value;
        const header = header_1.default.parse(headerBuff);
        // if request status = success in header
        if (header.getStatus().state) {
            let data;
            const dataBuff = buffIt.next(header.dataLengt).value;
            // ENHANCE : improve EnipData object selection
            switch (header.command) {
                case 0x63:
                    data = data_1.ListIdentity.parse(dataBuff);
                    break;
                case 0x65:
                    data = data_1.RegisterSession.parse(dataBuff);
                    break;
                case 0x6f:
                    data = data_1.SendRR.parse(dataBuff);
                    break;
                default:
                    // eslint-disable-next-line max-len
                    throw new Error(`The enip command <${header.command} is not valid or not implemented.`);
            }
            return new EnipMessage(header, data);
        }
        else {
            return new EnipMessage(header);
        }
    }
    /**
     * Encode the Enip instance to Buffer
     * @return {Buffer} datagram describing the Enip instance
     */
    encode() {
        const headerBuff = this._header.encode();
        if (this._data != undefined) {
            const dataBuff = this._data.encode();
            return Buffer.concat([headerBuff, dataBuff]);
        }
        else {
            return headerBuff;
        }
    }
    /**
     * Convert the Enip instance to JSON
     * @return {object} a Enip JSON representation
     */
    toJSON() {
        return {
            enipData: this._data ? this._data.toJSON() : null,
            enipHeader: this._header.toJSON(),
        };
    }
}
exports.EnipMessage = EnipMessage;
