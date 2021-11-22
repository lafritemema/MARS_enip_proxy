"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Iterator = exports.Type = exports.SocketAddr = exports.ListIdentity = exports.Data = exports.Address = exports.buildSequencedAddressItem = exports.buildConnectedAddressItem = exports.buildNullAddressItem = exports.buildConnectedDataItem = exports.buildUnconnectedDataItem = void 0;
const item_1 = require("./item");
const address_item_1 = require("./address_item");
Object.defineProperty(exports, "Address", { enumerable: true, get: function () { return address_item_1.AddressItem; } });
const data_item_1 = require("./data_item");
Object.defineProperty(exports, "Data", { enumerable: true, get: function () { return data_item_1.DataItem; } });
const list_identity_item_1 = require("./list_identity_item");
Object.defineProperty(exports, "ListIdentity", { enumerable: true, get: function () { return list_identity_item_1.ListIdentityItem; } });
const socketaddr_item_1 = require("./socketaddr_item");
Object.defineProperty(exports, "SocketAddr", { enumerable: true, get: function () { return socketaddr_item_1.SocketAddrItem; } });
const item_type_1 = require("./item_type");
Object.defineProperty(exports, "Type", { enumerable: true, get: function () { return item_type_1.ItemType; } });
const item_iterator_1 = require("./item_iterator");
Object.defineProperty(exports, "Iterator", { enumerable: true, get: function () { return item_iterator_1.ItemIterator; } });
/**
   * Build an Unconnected Data Item
   * @param {Message} data a CIP Message instance describing the data
   * @return {DataItem} specific Data item instance
   */
function buildUnconnectedDataItem(data) {
    return new data_item_1.DataItem(item_type_1.ItemType.UNCONNECTED_MESSAGE, data.length, data);
}
exports.buildUnconnectedDataItem = buildUnconnectedDataItem;
/**
 * Build an Unconnected Data Item
 * @param {Message} data a CIP Message instance describing the data
 * @return {DataItem} specific Data item instance
 */
function buildConnectedDataItem(data) {
    return new data_item_1.DataItem(item_type_1.ItemType.CONNECTED_TRANSPORT, data.length, data);
}
exports.buildConnectedDataItem = buildConnectedDataItem;
/**
 * Build an Null CPF Address Item
 * @return {AddressItem} specific Address item instance
 */
function buildNullAddressItem() {
    return new address_item_1.AddressItem(item_type_1.ItemType.ADDR_NULL, 0);
}
exports.buildNullAddressItem = buildNullAddressItem;
/**
 * Build an connected based CPF Address Item
 * @param {number} connectionId connection identifier
 * @return {AddressItem} specific Address item instance
 */
function buildConnectedAddressItem(connectionId) {
    return new address_item_1.AddressItem(item_type_1.ItemType.CONNECTION_BASED, 4, [connectionId]);
}
exports.buildConnectedAddressItem = buildConnectedAddressItem;
/**
 * Build an connected based CPF Address Item
 * @param {number} connectionId connection identifier
 * @param {number} sequenceNbr sequence number
 * @return {AddressItem} specific Address item instance
 */
function buildSequencedAddressItem(connectionId, sequenceNbr) {
    return new address_item_1.AddressItem(item_type_1.ItemType.CONNECTION_BASED, 8, [connectionId, sequenceNbr]);
}
exports.buildSequencedAddressItem = buildSequencedAddressItem;
exports.default = item_1.Item;
