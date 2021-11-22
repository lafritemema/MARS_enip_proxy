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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListIdentityItem = void 0;
const cip = __importStar(require("../../../../cip"));
const utils_1 = require("../../../../utils");
const item_1 = require("./item");
const item_type_1 = require("./item_type");
const socketaddr_item_1 = require("./socketaddr_item");
/**
 * Class describing the list
 */
class ListIdentityItem extends item_1.Item {
    /**
     * ListIdentityItem instance constructor
     * @param {Identity} identity Identity object instance describing the device identity
     * @param {SocketAddrItem} socketAddress SocketAddress Item instance describing the communication socket information
     */
    constructor(identity, socketAddress) {
        super(item_type_1.ItemType.LIST_IDENTITY, identity.length + socketAddress.dataLength + 2);
        this._encProtocol = 1;
        this._socketAddress = socketAddress;
        this._identity = identity;
    }
    /**
     * Get the identity object
     */
    get identity() {
        return this._identity.toJSON();
    }
    /**
     * Parse the buffer describing the ListIdentity Item
     * @param {Buffer} listIdentityItemBuff buffer describing the Identity object
     * @return {ListIdentityItem} a ListIdentityItem instance
     */
    static parse(listIdentityItemBuff) {
        const buffIt = new utils_1.BufferIterator(listIdentityItemBuff);
        const typeCode = buffIt.next(2).value.readUInt16LE();
        const dataLength = buffIt.next(2).value.readUInt16LE();
        const encProtocol = buffIt.next(2).value.readUInt16LE();
        checkEncapsulationProtocol(encProtocol);
        checkTypeCode(typeCode);
        const socketAddrBuffer = buffIt.next(16).value;
        const socketAddress = new socketaddr_item_1.SocketAddrItem();
        socketAddress.parseData(socketAddrBuffer);
        // get the identityItem buffer
        // => next X bytes where X = length of ListIdentityItem - length of socketaddr data - 2 byte for enc protocol
        const identityBuffer = buffIt.next(dataLength - socketAddress.dataLength - 2).value;
        const identity = cip.Identity.parse(identityBuffer);
        return new ListIdentityItem(identity, socketAddress);
    }
    /**
     * Parse the buffer describing the ListIdentityItem data
     * @param {Buffer} dataBuffer buffer describing the Identity object
     */
    parseData(dataBuffer) {
        this._dataLength = dataBuffer.length;
        const buffIt = new utils_1.BufferIterator(dataBuffer);
        // get the protocol : first 2 bytes
        const encProtocol = buffIt.next(2).value.readUInt16LE();
        // get the socketAddr next 16 bytes
        const socketAddrBuffer = buffIt.next(16).value;
        const socketAddress = new socketaddr_item_1.SocketAddrItem();
        socketAddress.parseData(socketAddrBuffer);
        // get the identityItem buffer
        // => next X bytes where X = length of ListIdentityItem - length of socketaddr data - 2 byte for enc protocol
        const identityBuffer = buffIt.next(this.dataLength - socketAddress.dataLength - 2).value;
        const identity = cip.Identity.parse(identityBuffer);
        this._encProtocol = encProtocol;
        this._socketAddress = socketAddress;
        this._identity = identity;
    }
    /**
     * Encode the ListIdentity Item instance to Buffer
     * @return {Buffer} datagram describing the ListIdentity Item
     */
    encode() {
        const metaBuffer = Buffer.alloc(4);
        metaBuffer.writeUInt16LE(this.type, 0);
        metaBuffer.writeUInt16LE(this._dataLength, 2);
        const protocolBuffer = Buffer.alloc(2);
        protocolBuffer.writeUInt16LE(this._encProtocol);
        const socketAddrBuffer = this._socketAddress.encodeData();
        const identityBuffer = this._identity.encode();
        return Buffer.concat([
            metaBuffer,
            protocolBuffer,
            socketAddrBuffer,
            identityBuffer
        ]);
    }
    /**
     * Convert the ListIdentityItem instance to JSON
     * @return {object} a ListIdentityItem JSON representation
     */
    toJSON() {
        return {
            identity: this._identity.toJSON(),
            socketAddress: this._socketAddress.dataToJSON(),
            protocol: this._encProtocol,
        };
    }
    /**
     * Get the item type under string format
     * @return {string} item type
     */
    getType() {
        return item_type_1.ItemType[this._type];
    }
}
exports.ListIdentityItem = ListIdentityItem;
/**
 * Check if the listIdentity item encapsulation protocol is conform
 * @param {number} encProtocol encapsulation protocol code
 */
function checkEncapsulationProtocol(encProtocol) {
    if (encProtocol != 1) {
        // eslint-disable-next-line max-len
        throw new Error(`ERROR: The list identity item encpasulation protocol <${encProtocol}> is not conform. expected 1`);
    }
}
/**
 * Check if the listIdentity item type code is conform
 * @param {number} typeCode istIdentity item type code
 */
function checkTypeCode(typeCode) {
    if (typeCode != item_type_1.ItemType.LIST_IDENTITY) {
        // eslint-disable-next-line max-len
        throw new Error(`ERROR: The list identity item type code <${typeCode}> is not conform.
    expected ${item_type_1.ItemType.LIST_IDENTITY}`);
    }
}
