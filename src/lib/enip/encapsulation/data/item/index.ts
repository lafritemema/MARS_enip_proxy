import {Message as CipMessage} from 'cip/message/message';
import {Item as GItem} from './item';
import {AddressItem} from './address_item';
import {DataItem} from './data_item';
import {ListIdentityItem} from './list_identity_item';
import {SocketAddrItem} from './socketaddr_item';
import {ItemType} from './item_type';
import {ItemIterator, ItemIteration} from './item_iterator';

const Item = {
  Item: GItem,
  Address: AddressItem,
  Data: DataItem,
  ListIdentity: ListIdentityItem,
  SocketAddr: SocketAddrItem,
  Type: ItemType,

  /**
   * Build an Unconnected Data Item
   * @param {Message} data a CIP Message instance describing the data
   * @return {DataItem} specific Data item instance
   */
  buildUnconnectedDataItem(data:CipMessage) : DataItem {
    return new DataItem(Item.Type.DATA_UNCONNECTED_MESSAGE, data.length,
        data);
  },

  /**
   * Build an Unconnected Data Item
   * @param {Message} data a CIP Message instance describing the data
   * @return {DataItem} specific Data item instance
   */
  buildConnectedDataItem(data:CipMessage) : DataItem {
    return new DataItem(Item.Type.DATA_CONNECTED_TRANSPORT, data.length,
        data);
  },

  /**
   * Build an Null CPF Address Item
   * @return {AddressItem} specific Address item instance
   */
  buildNullAddressItem():AddressItem {
    return new AddressItem(ItemType.ADDR_NULL, 0);
  },

  /**
   * Build an connected based CPF Address Item
   * @param {number} connectionId connection identifier
   * @return {AddressItem} specific Address item instance
   */
  buildConnectedAddressItem(connectionId:number):AddressItem {
    return new AddressItem(ItemType.ADDR_CONNECTION_BASED, 4,
        [connectionId]);
  },

  /**
   * Build an connected based CPF Address Item
   * @param {number} connectionId connection identifier
   * @param {number} sequenceNbr sequence number
   * @return {AddressItem} specific Address item instance
   */
  buildSequencedAddressItem(connectionId:number,
      sequenceNbr:number) {
    return new AddressItem(ItemType.ADDR_SEQUENCED_ADDRESS, 8,
        [connectionId, sequenceNbr]);
  },
};

export {Item,
  ItemIterator,
  ItemIteration};
