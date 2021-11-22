"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressItem = void 0;
const item_1 = require("./item");
const item_type_1 = require("./item_type");
const utils_1 = require("../../../../utils");
/**
 * Class describing an Common Packet Format address item
 */
class AddressItem extends item_1.Item {
    /**
     * AddressItem instance constructor
     * @param {number} addressTypeCode CPF item type code
     * @param {number} length CPF item lenght in byte
     * @param {number[]} data connection identifier[+sequence nbr] if needed default empty Array
     */
    constructor(addressTypeCode = item_type_1.ItemType.ADDR_NULL, length = 0, data = []) {
        super(addressTypeCode, length);
        this._data = data;
    }
    /**
     * Convert the AdressItem instance to JSON
     * @return {object} a AdressItem JSON representation
     */
    toJSON() {
        const jsonObj = {
            itemType: item_type_1.ItemType[this._type],
            length: this.length,
        };
        if (this._data[0])
            jsonObj['connectionId'] = this._data[0];
        if (this._data[1])
            jsonObj['sequenceNbr'] = this._data[1];
        return jsonObj;
    }
    /**
     * Encode the Address Item instance to Buffer
     * @return {Buffer} data frame describing the address item
     */
    encode() {
        // metabuffer size 4 bytes => <item type, data length>
        const metaBuffer = Buffer.alloc(4);
        metaBuffer.writeUInt8(this._type, 0);
        metaBuffer.writeUInt8(this._dataLength, 2);
        // databuffer size 4 byte x nb element in this._data
        const dataBuffer = Buffer.alloc(this._dataLength);
        let pointer = 0;
        for (const d of this._data) {
            dataBuffer.writeUInt32LE(d, pointer);
            pointer += 4;
        }
        return Buffer.concat([metaBuffer, dataBuffer]);
    }
    /**
     * Parse a buffer describing the CPF Address Item
     * @param {Buffer} dataBuffer buffer describing the CPF Address Item
     */
    parseData(dataBuffer) {
        const data = [];
        const buffIt = new utils_1.BufferIterator(dataBuffer);
        // each element of address item data is size 4 byte
        // extract the first 4 bytes of dataBuffer using the bufferIterator
        let buffItEl = buffIt.next(4);
        while (!buffItEl.done) {
            data.push(buffItEl.value.readUInt32LE());
            buffItEl = buffIt.next(4);
        }
        this._dataLength = dataBuffer.length;
        this._data = data;
    }
    /**
     * Get the item type under string format
     * @return {string} item type
     */
    getType() {
        return item_type_1.ItemType[this._type];
    }
}
exports.AddressItem = AddressItem;
