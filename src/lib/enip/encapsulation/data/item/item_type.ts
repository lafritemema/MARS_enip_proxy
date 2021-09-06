import {Item} from './item';
import {AddressItem} from './address_item';
import {DataItem} from './data_item';

/* eslint-disable no-unused-vars */
export enum ItemType {
    ADDR_NULL= 0X00, // address item (used for UCMM messages) Indicates that encapsulation routing is NOT needed
    DATA_LIST_IDENTITY= 0X0C, // data item
    ADDR_CONNECTION_BASED= 0XA1, // address item
    DATA_CONNECTED_TRANSPORT= 0XB1, // data item
    DATA_UNCONNECTED_MESSAGE= 0XB2, // data item
    DATA_LIST_SERVICES= 0X100, // data item
    DATA_SOCKADDR_O2T= 0X8000, // data item
    DATA_SOCKADDR_T2O= 0X8001, // data item
    ADDR_SEQUENCED_ADDRESS= 0X8002 // address item
}
/**
 * Check if the item type code is conform
 * @param {number} itemType item type code
 */
function checkItemType(itemType:number) {
  if (ItemType[itemType]==undefined) {
    // eslint-disable-next-line max-len
    throw new Error(`ERROR: The item type code <${itemType}> is not a valid item type code.`);
  }
}

/**
 * Build a typed item from the metadata buffer
 * @param {Buffer} metaBuffer buffer containing metadata
 * @return {Item} a typed item heritate from Item
*/
export function buildTypedItem(metaBuffer:Buffer):Item {
  // eslint-disable-next-line new-cap

  const typeCode = metaBuffer.readUInt16LE(0);
  checkItemType(typeCode);
  const dataLength = metaBuffer.readUInt16LE(2);

  switch (ItemType[typeCode]) {
    case 'ADDR_NULL':
    case 'ADDR_CONNECTION_BASED':
    case 'ADDR_SEQUENCED_ADDRESS':
      return new AddressItem(typeCode, dataLength);
      break;
    case 'DATA_CONNECTED_TRANSPORT': // data item
    case 'DATA_UNCONNECTED_MESSAGE':
    case 'DATA_SOCKADDR_O2T':
    case 'DATA_SOCKADDR_T2O':
      return new DataItem(typeCode, dataLength);
      break;
    // case 'DATA_LIST_IDENTITY':
    // case 'DATA_LIST_SERVICES':
    default:
      throw new Error(`Item with type <${ItemType[typeCode]}>,
      code <${typeCode} is not implemented yet`);
  }
}


