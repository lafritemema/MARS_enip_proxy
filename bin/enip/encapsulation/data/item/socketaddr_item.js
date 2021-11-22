"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketAddrItem = void 0;
const item_type_1 = require("./item_type");
const utils_1 = require("../../../../utils");
const item_1 = require("./item");
/**
 * Class describing a SocketAddr Item
 */
class SocketAddrItem extends item_1.Item {
    /**
     * SocketAddrItem constructor
     * @param {number|string} sinAddr IP address in string or num format
     * @param {number} typeCode item type code for SocketAddr
     * DATA_SOCKADDR_O2T (0X8000) or DATA_SOCKADDR_T2O (0X8001)
     * default DATA_SOCKADDR_O2T
     * @param {number} sinPort cummounication port number, default 44818
     */
    constructor(sinAddr = 0, typeCode = item_type_1.ItemType.SOCKADDR_O2T, sinPort = 44818) {
        super(typeCode, 16);
        this._sinFamilly = 2;
        this._sinZero = Array(8).fill(0);
        checkSocketAddrTypeCode(typeCode);
        this._sinPort = sinPort;
        if (typeof sinAddr == 'string') {
            this._sinAddr = utils_1.convertIp2Num(sinAddr, 'BE');
        }
        else {
            this._sinAddr = sinAddr;
        }
    }
    // TODO : static parse function (meta + data)
    /**
     * Set the sinFamilly parameter
     * @param {number} sinFamilly sinFamilly parameter
     */
    set sinFamilly(sinFamilly) {
        this._sinFamilly = sinFamilly;
    }
    /**
     * Parse a buffer describing the SocketAddr item data
     * @param {Buffer} dataBuffer buffer describing the SocketAddr item data
     */
    parseData(dataBuffer) {
        const buffIt = new utils_1.BufferIterator(dataBuffer);
        const sinFamilly = buffIt.next(2).value.readInt16BE();
        const sinPort = buffIt.next(2).value.readUInt16BE();
        const sinAddr = buffIt.next(4).value.readUInt32BE();
        // ENHANCE : not Bing Endian read but normally each number is 0
        const sinZero = Array.from(buffIt.next(8).value);
        checkSinFamilly(sinFamilly);
        checkSinZero(sinZero);
        checkSinAddress(sinAddr);
        this._sinPort = sinPort;
        this._sinAddr = sinAddr;
        this._sinFamilly = sinFamilly;
        this._sinZero = sinZero;
    }
    /**
     * Encode the SocketAddr Item instance to Buffer
     * @return {Buffer} datagram describing the SocketAddr Item
     */
    encode() {
        const dataBuffer = this.encodeData();
        const metaBuffer = Buffer.alloc(4);
        metaBuffer.writeUInt16LE(this._type, 0);
        metaBuffer.writeUInt16LE(dataBuffer.length, 2);
        return Buffer.concat([metaBuffer, dataBuffer]);
    }
    /**
     * Encode only the SocketAddr Item instance data to Buffer
     * to encoding all SocketAddress Item use encode() function instead
     * @return {Buffer} datagram describing the SocketAddr Item data
     */
    encodeData() {
        const socketBuff = Buffer.alloc(8);
        socketBuff.writeInt16BE(this._sinFamilly, 0);
        socketBuff.writeUInt16BE(this._sinPort, 2);
        socketBuff.writeUInt32BE(this._sinAddr, 4);
        // ENHANCE : not Bing Endian write but normally each number is 0
        const zeroBuffer = Buffer.from(this._sinZero);
        return Buffer.concat([socketBuff, zeroBuffer]);
    }
    /**
     * Convert the SocketAddr instance to JSON
     * @return {object} a SocketAddr JSON representation
     */
    toJSON() {
        const socketJson = this.dataToJSON();
        socketJson['itemType'] = item_type_1.ItemType[this._type];
        socketJson['length'] = this.length;
        return socketJson;
    }
    /**
     * Convert the data of SocketAddr instance to JSON
     * @return {object} JSON representation of data of SocketAddr instance
     */
    dataToJSON() {
        return {
            sinFamilly: this._sinFamilly,
            sinPort: this._sinPort,
            sinAddress: utils_1.convertNum2Ip(this._sinAddr, 'BE'),
            sinZero: this._sinZero,
        };
    }
    /**
     * Get the group of item type
     * @return {string} item group
     */
    get group() {
        return 'DATA';
    }
}
exports.SocketAddrItem = SocketAddrItem;
/**
 * Check if the item type code is a SocketAddr type code
 * @param {number} typeCode item type code to check
 */
function checkSocketAddrTypeCode(typeCode) {
    if (typeCode != item_type_1.ItemType.SOCKADDR_O2T &&
        typeCode != item_type_1.ItemType.SOCKADDR_T2O) {
        // eslint-disable-next-line max-len
        throw new Error(`ERROR: The Item type <${typeCode}> is not an available SocketAddr Item type`);
    }
}
/**
 * Check if the sin familly number is conform
 * @param {number} sinFamilly the sin familly number to check
 */
function checkSinFamilly(sinFamilly) {
    if (sinFamilly != 2 && sinFamilly != 512) {
        // eslint-disable-next-line max-len
        throw new Error(`ERROR: The SocketAddr sin familly <${sinFamilly}> is not conform, must be 2.`);
    }
}
/**
 * Check if the sin zero array is conform
 * @param {number[]} sinZero the sin zero array to check
 */
function checkSinZero(sinZero) {
    if (!sinZero.every((el) => el == 0)) {
        // eslint-disable-next-line max-len
        throw new Error(`ERROR: The SocketAddr sin zero <${sinZero}> is not conform, must be ${Array(8).fill(0)}.`);
    }
}
/**
 * Check if the sin address number is conform
 * @param {number} sinAddress the sin address to check
 */
function checkSinAddress(sinAddress) {
    // eslint-disable-next-line max-len
    const maxSinAddr = Buffer.from([255, 255, 255, 255]).readUInt32BE();
    if (sinAddress > maxSinAddr) {
        // eslint-disable-next-line max-len
        throw new Error(`ERROR: The SocketAddr sin address <${sinAddress}> is not conform, must be lower than ${maxSinAddr}.`);
    }
}
