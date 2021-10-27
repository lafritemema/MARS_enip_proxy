"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataItem = void 0;
const item_type_1 = require("./item_type");
const cip_1 = require("../../../../cip");
const item_1 = require("./item");
/**
 * Class describing an Common Packet Format data item
 */
class DataItem extends item_1.Item {
    /**
     * DataItem instance constructor
     * @param {number} dataTypeCode CPF item type code default (DATA_UNCONNECTED_MESSAGE)
     * @param {number} dataLength CIP Message length in byte, default 0
     * @param {Message} message a CIP Message instance describing the data
     */
    constructor(dataTypeCode = item_type_1.ItemType.UNCONNECTED_MESSAGE, dataLength = 0, message) {
        super(dataTypeCode, dataLength);
        this._message = message;
    }
    /**
     * get item message data
     */
    get message() {
        return this._message;
    }
    /**
     * Convert the DataItem instance to JSON
     * @return {object} a DataItem JSON representation
     */
    toJSON() {
        return {
            itemType: item_type_1.ItemType[this._type],
            length: this.length,
            data: this._message ? this._message.toJSON() : null,
        };
    }
    /**
     * Encode the Data Item instance to Buffer
     * @return {Buffer} data frame describing the address item
     */
    encode() {
        // dataBuffer = encoded CIP message
        if (this._message == undefined) {
            // eslint-disable-next-line max-len
            throw new Error('ERROR: The CPF data item is not conform. Encoding is impossible.');
        }
        const dataBuffer = this._message.encode();
        // metabuffer size 4 bytes => <item type (2 bytes), data length (2 bytes)>
        const metaBuffer = Buffer.alloc(4);
        metaBuffer.writeUInt16LE(this._type, 0);
        metaBuffer.writeUInt16LE(dataBuffer.length, 2);
        return Buffer.concat([metaBuffer, dataBuffer]);
    }
    /**
     * Parse a buffer describing the CPF data Item
     * @param {Buffer} dataBuffer buffer describing the CPF Address Item
     */
    parseData(dataBuffer) {
        this._dataLength = dataBuffer.length;
        const cipMessage = cip_1.CIPMessage.parse(dataBuffer);
        this._message = cipMessage;
    }
    /**
     * Get the item type under string format
     * @return {string} item type
     */
    getType() {
        return item_type_1.ItemType[this._type];
    }
}
exports.DataItem = DataItem;
