"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Item = void 0;
/**
 * Class describing an encapsulation item
 */
class Item {
    /**
     * Item instance constructor
     * @param {number} type CPF item type code
     * @param {number} dataLength Item length in bytes
     */
    constructor(type, dataLength = 0) {
        // ENHANCE : integrate best optimized item type check
        // checkItemType(type);
        this._type = type;
        this._dataLength = dataLength;
    }
    /**
     * Get the Item length in bytes
     * @return {number} Item length
     */
    get length() {
        // data length + metadata length (typeid + length = 4 bytes)
        return this._dataLength + 4;
    }
    /**
     * Get the Item data length in bytes
     * @return {number} Item data length
     */
    get dataLength() {
        return this._dataLength;
    }
    /**
     * Get the item type code
     * @return {number} item type code
     */
    get type() {
        return this._type;
    }
}
exports.Item = Item;
