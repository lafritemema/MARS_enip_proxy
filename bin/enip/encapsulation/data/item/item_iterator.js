"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemIterator = void 0;
const utils_1 = require("../../../../utils");
const item_type_1 = require("./item_type");
const address_item_1 = require("./address_item");
const data_item_1 = require("./data_item");
/**
 * Class describing an ItemIterator
 */
class ItemIterator {
    /**
     * ItemIterator instance constructor
     * @param {Buffer} itemsBuffer datagram containing items
     */
    constructor(itemsBuffer) {
        this._bufferIt = new utils_1.BufferIterator(itemsBuffer);
    }
    /**
     * Iteration function to parse and extract items
     * @return {ItemIteration} object containing the next item if exist
     */
    next() {
        const itemMetaIt = this._bufferIt.next(4);
        if (!itemMetaIt.done) {
            const metaBuffer = itemMetaIt.value;
            const typeCode = metaBuffer.readUInt16LE(0);
            item_type_1.checkItemType(typeCode);
            const dataLength = metaBuffer.readUInt16LE(2);
            let item;
            switch (item_type_1.ItemType[typeCode]) {
                case 'ADDR_NULL':
                case 'CONNECTION_BASED':
                case 'SEQUENCED_ADDRESS':
                    item = new address_item_1.AddressItem(typeCode, dataLength);
                    break;
                case 'CONNECTED_TRANSPORT': // data item
                case 'UNCONNECTED_MESSAGE':
                case 'SOCKADDR_O2T':
                case 'SOCKADDR_T2O':
                    item = new data_item_1.DataItem(typeCode, dataLength);
                    break;
                // case 'DATA_LIST_IDENTITY':
                // case 'DATA_LIST_SERVICES':
                default:
                    throw new Error(`Item with type <${item_type_1.ItemType[typeCode]}>,
          code <${typeCode} is not implemented yet`);
            }
            if (dataLength > 0) {
                const dataBuffer = this._bufferIt.next(dataLength).value;
                item.parseData(dataBuffer);
            }
            return { value: item, done: false };
        }
        else {
            return { value: undefined, done: true };
        }
    }
}
exports.ItemIterator = ItemIterator;
