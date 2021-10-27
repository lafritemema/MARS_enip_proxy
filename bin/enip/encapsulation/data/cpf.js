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
exports.EnipCPF = void 0;
const item = __importStar(require("./item"));
/**
 * Class describing Common Packet Format
 * @class
 */
class EnipCPF {
    /**
     * EnipCPF instance constructor
     * @param {AddressItem} addressItem AddressItem instance containing addressing informations
     * @param {DataItem} dataItem DataItem instance containing encapsulated data
     * @param {Item} optionalItems list of other CPF items, default empty array
     */
    constructor(addressItem, dataItem, optionalItems = []) {
        this._addressItem = addressItem;
        this._dataItem = dataItem;
        this._optionalItems = optionalItems;
    }
    /**
     * Get the CPF packet length in bytes
     * @return {number} CPF packet length
     */
    get length() {
        const metadataLength = 2;
        if (this._optionalItems.length > 0) {
            let oilength = 0;
            for (const i of this._optionalItems) {
                oilength += i.length;
            }
            return this._addressItem.length +
                this._dataItem.length +
                oilength +
                metadataLength;
        }
        else {
            return this._addressItem.length +
                this._dataItem.length +
                metadataLength;
        }
    }
    /**
     * get item containing data
     */
    get dataItem() {
        return this._dataItem;
    }
    /**
       * Parse the Enip CPF buffer
       * @param {Buffer} cpfBuffer buffer describing the CPF
       * @return {EnipCPF} a EnipCPF instance
       */
    static parse(cpfBuffer) {
        // const buffIter = new BufferIterator(buffer);
        // read the buffer first byte to get the item count
        const itemCount = cpfBuffer.readUInt16LE(0);
        checkItemCount(itemCount);
        const itemIt = new item.Iterator(cpfBuffer.slice(2));
        let iteration = itemIt.next();
        let dataItem;
        let addressItem;
        if (!iteration.done && iteration.value instanceof item.Address) {
            addressItem = iteration.value;
        }
        else {
            // eslint-disable-next-line max-len
            throw new Error(`ERROR : The CPF packet first item must be an AddressItem instance instead of ${typeof iteration}.`);
        }
        iteration = itemIt.next();
        if (!iteration.done && iteration.value instanceof item.Data) {
            dataItem = iteration.value;
        }
        else {
            // eslint-disable-next-line max-len
            throw new Error(`ERROR : The CPF packet second item must be an DataItem instance instead of ${typeof iteration}.`);
        }
        const otherItem = [];
        if (itemCount > 2) {
            let itemIteration = itemIt.next();
            while (!itemIteration.done) {
                otherItem.push(itemIteration.value);
                itemIteration = itemIt.next();
            }
        }
        return new EnipCPF(addressItem, dataItem, otherItem);
    }
    /**
     * Encode the CPF instance in a Buffer
     * @return {Buffer} a buffer describing CPF
     */
    encode() {
        // write item nbr on the next 2 bytes : 2 + optionnal items
        const metadataBuff = Buffer.alloc(2);
        metadataBuff.writeUInt16LE(2 + this._optionalItems.length);
        const buffArray = [metadataBuff,
            this._addressItem.encode(),
            this._dataItem.encode()];
        // encode informations about optionnal items if exists
        if (this._optionalItems.length > 0) {
            for (const oi of this._optionalItems) {
                // @ts-ignore
                buffArray.push(oi.encode());
            }
        }
        // return a Buffer metadata + addressitem + data item + optionnal items ...
        return Buffer.concat(buffArray);
    }
    /**
     * Convert the EnipCPF instance to JSON
     * @return {object} a EnipCPF JSON representation
     */
    toJSON() {
        const optObj = [];
        if (this._optionalItems.length > 0) {
            for (const i of this._optionalItems) {
                // @ts-ignore
                optObj.push(i.toJSON());
            }
        }
        return {
            addressItem: this._addressItem.toJSON(),
            dataItem: this._dataItem.toJSON(),
            optionalItems: optObj,
        };
    }
}
exports.EnipCPF = EnipCPF;
/**
 * Check if the number on Item in CPF is conform
 * @param {number} itemCount number of item
 */
function checkItemCount(itemCount) {
    if (itemCount < 2) {
        // eslint-disable-next-line max-len
        throw new Error(`ERROR : The CPF packet must contains at least 2 items (address + data). Only ${itemCount} found.`);
    }
}
