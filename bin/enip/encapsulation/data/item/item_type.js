"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkItemType = exports.ItemType = void 0;
/* eslint-disable no-unused-vars */
var ItemType;
(function (ItemType) {
    ItemType[ItemType["ADDR_NULL"] = 0] = "ADDR_NULL";
    ItemType[ItemType["LIST_IDENTITY"] = 12] = "LIST_IDENTITY";
    ItemType[ItemType["CONNECTION_BASED"] = 161] = "CONNECTION_BASED";
    ItemType[ItemType["CONNECTED_TRANSPORT"] = 177] = "CONNECTED_TRANSPORT";
    ItemType[ItemType["UNCONNECTED_MESSAGE"] = 178] = "UNCONNECTED_MESSAGE";
    ItemType[ItemType["LIST_SERVICES"] = 256] = "LIST_SERVICES";
    ItemType[ItemType["SOCKADDR_O2T"] = 32768] = "SOCKADDR_O2T";
    ItemType[ItemType["SOCKADDR_T2O"] = 32769] = "SOCKADDR_T2O";
    ItemType[ItemType["SEQUENCED_ADDRESS"] = 32770] = "SEQUENCED_ADDRESS"; // address item
})(ItemType = exports.ItemType || (exports.ItemType = {}));
/**
 * Check if the item type code is conform
 * @param {number} itemType item type code
 */
function checkItemType(itemType) {
    if (ItemType[itemType] == undefined) {
        // eslint-disable-next-line max-len
        throw new Error(`ERROR: The item type code <${itemType}> is not a valid item type code.`);
    }
}
exports.checkItemType = checkItemType;
