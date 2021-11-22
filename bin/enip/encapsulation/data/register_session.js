"use strict";
// QUESTION :register session information are not very usefull but they are exist
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterSession = void 0;
/**
 * Class describe RegisterSession command specific data
 */
class RegisterSession {
    /**
     * RegisterSession instance constructor
     */
    constructor() {
        this._protocol = 1;
        this._optionFlags = 0;
    }
    /**
     * Get the RegisterSession length in bytes
     * @return {number} Item length
     */
    get length() {
        return 4;
    }
    /**
     * return true if no error on cip message
     */
    get isSuccess() {
        // ENHANCE : not very clean, to enhance
        // return true if no error on cip message
        // always true for register_session type msg
        return true;
    }
    /**
     * return true is the message has a body
     */
    get hasBody() {
        // register_session message never have a body
        return false;
    }
    /**
     * Encode the RegisterSession instance to Buffer
     * @return {Buffer} datagram describing the ListIdentity
     */
    encode() {
        const regSessionBuff = Buffer.alloc(4);
        regSessionBuff.writeUInt16LE(this._protocol, 0);
        regSessionBuff.writeUInt16LE(this._optionFlags, 2);
        return regSessionBuff;
    }
    /**
     * Parse a buffer describing the RegisterSession encapsulated data
     * @param {Buffer} regSessionBuffer buffer describing the listitem encapsulated data
     * @return {ListIdentity} a ListIdentity instance
     */
    static parse(regSessionBuffer) {
        const protocol = regSessionBuffer.readUInt16LE(0);
        const optionFlags = regSessionBuffer.readUInt16LE(2);
        checkProtocol(protocol);
        checkOptionFlags(optionFlags);
        return new RegisterSession();
    }
    /**
     * Convert the RegisterSession instance to JSON
     * @return {object} a RegisterSession JSON representation
     */
    toJSON() {
        return {
            protocolVersion: this._protocol,
            optionFlags: this._optionFlags,
        };
    }
}
exports.RegisterSession = RegisterSession;
/**
 * Check if the Register session protocol version conform
 * @param {number} protocol ListIdentity item count
 */
function checkProtocol(protocol) {
    if (protocol != 1) {
        // eslint-disable-next-line max-len
        throw new Error(`ERROR: The RegisterSession protocol version is not conform.
    expected 1 instead of <${protocol}>`);
    }
}
/**
 * Check if the Register session options flags code is conform
 * @param {number} optionFlags  options flags code
 */
function checkOptionFlags(optionFlags) {
    if (optionFlags != 0) {
        // eslint-disable-next-line max-len
        throw new Error(`ERROR: The RegisterSession optionFlags code is not conform.
    expected 0 instead of <${optionFlags}>`);
    }
}
// TODO : test for register session
