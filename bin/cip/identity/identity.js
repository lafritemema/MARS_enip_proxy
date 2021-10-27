"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Identity = void 0;
const utils_1 = require("../../utils");
const device_profile_1 = require("./device/device_profile");
const device_state_1 = require("./device/device_state");
// ENHANCE : improve access to vendor name
// eslint-disable-next-line max-len
const VendorName = require('./vendor_name.json');
/**
 * Class describing a CIP Identity object
 */
class Identity {
    /**
     * Identity object constructor
     * @param {number} vendorId vendor identification code
     * @param {number} deviceType product general type code
     * @param {number} productCode product specific type code
     * @param {number} majorRevision major version of product
     * @param {number} minorRevision minor version of product
     * @param {number} status status of device
     * @param {number} serialNumber serial number of device
     * @param {string} productName product name
     * @param {number} state present state of device
     */
    constructor(vendorId, deviceType, productCode, majorRevision, minorRevision, status, serialNumber, productName, state) {
        this._vendorId = vendorId;
        this._deviceType = deviceType;
        this._productCode = productCode;
        this._majorRevision = majorRevision;
        this._minorRevision = minorRevision;
        this._status = status;
        this._serialNumber = serialNumber;
        this._productName = productName;
        this._state = state;
    }
    /**
     * Get the IndentityObject length in bytes
     * @return {number} IndentityObject length
     */
    get length() {
        return this._productName.length + 16;
    }
    /**
     * Parse the buffer describing the Identity object
     * @param {Buffer} idObjectBuffer buffer describing the Identity object
     * @return {Identity} Identity instance
     */
    static parse(idObjectBuffer) {
        const buffIt = new utils_1.BufferIterator(idObjectBuffer);
        // get the vendorid => 2 first bytes
        const vendorId = buffIt.next(2).value.readUInt16LE();
        // get the device type => 2 next bytes
        const deviceType = buffIt.next(2).value.readUInt16LE();
        // get the product code => 2 next bytes
        const productCode = buffIt.next(2).value.readUInt16LE();
        // get the buffer describing the revision and extract major and minor rev
        const revisionBuff = buffIt.next(2).value;
        const majorRev = revisionBuff.readUInt8(0);
        const minorRev = revisionBuff.readUInt8(1);
        // get the product status
        const status = buffIt.next(2).value.readUInt16LE();
        // get the serial number
        const serialNbr = buffIt.next(4).value.readUInt32LE();
        // get the product name
        const productNameLenght = buffIt.next().value.readUInt8();
        const productName = buffIt.next(productNameLenght).value.toString();
        // get the product state
        const state = buffIt.next().value.readUInt8();
        return new Identity(vendorId, deviceType, productCode, majorRev, minorRev, status, serialNbr, productName, state);
    }
    ;
    /**
     * Build a buffer describing the Identity instance
     * @return {Buffer} buffer describing the Identity instance
     */
    encode() {
        // create a buffer to store informations
        const idBuffer = Buffer.alloc(16 + this._productName.length);
        idBuffer.writeUInt16LE(this._vendorId, 0);
        idBuffer.writeUInt16LE(this._deviceType, 2);
        idBuffer.writeUInt16LE(this._productCode, 4);
        idBuffer.writeInt8(this._majorRevision, 6);
        idBuffer.writeInt8(this._minorRevision, 7);
        idBuffer.writeUInt16LE(this._status, 8);
        idBuffer.writeUInt32LE(this._serialNumber, 10);
        idBuffer.writeUInt8(this._productName.length, 14);
        idBuffer.write(this._productName, 15);
        idBuffer.writeUInt8(this._state, 15 + this._productName.length);
        return idBuffer;
    }
    /**
     * Convert the IndentityObject instance to JSON
     * @return {object} the JSON representation
     */
    toJSON() {
        return {
            vendorId: this._vendorId,
            vendorName: VendorName[this._vendorId],
            deviceType: device_profile_1.DeviceProfile[this._deviceType]
                .replace(/((?!^)[A-Z])/g, ' $1'),
            productCode: this._productCode,
            revision: `${this._majorRevision}.${this._minorRevision}`,
            status: this._status,
            serialNumber: this._serialNumber.toString(16),
            productName: this._productName,
            state: device_state_1.DeviceState[this._state]
                .replace(/((?!^)[A-Z])/g, ' $1'), // transform camelcase to regular string
        };
    }
}
exports.Identity = Identity;
