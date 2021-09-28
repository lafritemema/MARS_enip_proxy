import {CIPMessage} from 'cip';
import {Item, ItemInterface} from './item';
import {AddressItem,
  AddressItemJSONObject} from './address_item';
import {DataItem,
  dataItemJSONObject} from './data_item';
import {ListIdentityItem} from './list_identity_item';
import {SocketAddrItem} from './socketaddr_item';
import {ItemType} from './item_type';
import {ItemIterator,
  ItemIteration} from './item_iterator';

/**
   * Build an Unconnected Data Item
   * @param {Message} data a CIP Message instance describing the data
   * @return {DataItem} specific Data item instance
   */
export function buildUnconnectedDataItem(data:CIPMessage) : DataItem {
  return new DataItem(ItemType.UNCONNECTED_MESSAGE, data.length,
      data);
}

/**
 * Build an Unconnected Data Item
 * @param {Message} data a CIP Message instance describing the data
 * @return {DataItem} specific Data item instance
 */
export function buildConnectedDataItem(data:CIPMessage) : DataItem {
  return new DataItem(ItemType.CONNECTED_TRANSPORT, data.length,
      data);
}

/**
 * Build an Null CPF Address Item
 * @return {AddressItem} specific Address item instance
 */
export function buildNullAddressItem():AddressItem {
  return new AddressItem(ItemType.ADDR_NULL, 0);
}

/**
 * Build an connected based CPF Address Item
 * @param {number} connectionId connection identifier
 * @return {AddressItem} specific Address item instance
 */
export function buildConnectedAddressItem(connectionId:number):AddressItem {
  return new AddressItem(ItemType.CONNECTION_BASED, 4,
      [connectionId]);
}

/**
 * Build an connected based CPF Address Item
 * @param {number} connectionId connection identifier
 * @param {number} sequenceNbr sequence number
 * @return {AddressItem} specific Address item instance
 */
export function buildSequencedAddressItem(connectionId:number,
    sequenceNbr:number):AddressItem {
  return new AddressItem(ItemType.CONNECTION_BASED, 8,
      [connectionId, sequenceNbr]);
}

export default Item;

export {
  AddressItem as Address,
  AddressItemJSONObject as AddressJSON,
  DataItem as Data,
  dataItemJSONObject as DataJSON,
  ListIdentityItem as ListIdentity,
  SocketAddrItem as SocketAddr,
  ItemType as Type,
  ItemIterator as Iterator,
  ItemIteration as Iteration,
  ItemInterface};

