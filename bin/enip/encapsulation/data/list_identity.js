"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListIdentity = void 0;
const list_identity_item_1 = require("./item/list_identity_item");
/**
 * Class describe ListIdentity command specific data
 */
class ListIdentity {
    /**
     * ListIdentity instance constructor
     * @param {ListIdentityItem} identityItem Identity item object
     */
    constructor(identityItem) {
        // QUESTION : itemcount always = 1 ??
        this._itemCount = 1;
        this._identityItem = identityItem;
    }
    /**
     * get identity informations
     */
    get identity() {
        return this._identityItem;
    }
    /**
     * get the body (essential informations) of the element
     */
    get body() {
        return {
            itemType: this._identityItem.getType(),
            identity: this._identityItem.toJSON(),
        };
    }
    /**
     * return true if no error on cip message
     */
    get isSuccess() {
        // ENHANCE : not very clean, to enhance
        // return true if no error on cip message
        // always true for list_indentity type msg
        return true;
    }
    /**
     * return true is the message has a body
     */
    get hasBody() {
        // list_identity message always have a body
        return true;
    }
    /**
     * Get the ListIdentity length in bytes
     * @return {number} Item length
     */
    get length() {
        return this._identityItem.length + 2;
    }
    /**
     * Encode the ListIdentity instance to Buffer
     * @return {Buffer} datagram describing the ListIdentity
     */
    encode() {
        const metaBuff = Buffer.alloc(2);
        metaBuff.writeUInt16LE(this._itemCount, 0);
        const identityItemBuffer = this._identityItem.encode();
        return Buffer.concat([
            metaBuff,
            identityItemBuffer,
        ]);
    }
    /**
     * Parse a buffer describing the listitem encapsulated data
     * @param {Buffer} listIdentityBuff buffer describing the listitem encapsulated data
     * @return {ListIdentity} a ListIdentity instance
     */
    static parse(listIdentityBuff) {
        const itemCount = listIdentityBuff.readUInt16LE(0);
        checkItemCount(itemCount);
        const identityBuffer = listIdentityBuff.slice(2);
        const identityItem = list_identity_item_1.ListIdentityItem.parse(identityBuffer);
        return new ListIdentity(identityItem);
    }
    /**
     * Convert the ListIdentityinstance to JSON
     * @return {object} a ListIdentity JSON representation
     */
    toJSON() {
        return {
            itemCount: 1,
            identityItem: this._identityItem.toJSON(),
        };
    }
}
exports.ListIdentity = ListIdentity;
// QUESTION : If not always 1, must update the function !!
/**
 * Check if the listIdentity item count is conform
 * @param {number} itemCount ListIdentity item count
 */
function checkItemCount(itemCount) {
    if (itemCount != 1) {
        // eslint-disable-next-line max-len
        throw new Error(`ERROR: The ListIdentity item count is not conform.
    expected 1 instead of <${itemCount}>`);
    }
}
// TODO : test for listidentity
