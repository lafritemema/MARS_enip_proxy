import {BufferIterator} from 'utils';
import {Item} from './item';
import {ItemType, checkItemType} from './item_type';
import {AddressItem} from './address_item';
import {DataItem} from './data_item';


export interface ItemIteration {
  value:Item|undefined,
  done:boolean,
}
/**
 * Class describing an ItemIterator
 */
export class ItemIterator {
  private _bufferIt:BufferIterator;

  /**
   * ItemIterator instance constructor
   * @param {Buffer} itemsBuffer datagram containing items
   */
  constructor(itemsBuffer:Buffer) {
    this._bufferIt = new BufferIterator(itemsBuffer);
  }

  /**
   * Iteration function to parse and extract items
   * @return {ItemIteration} object containing the next item if exist
   */
  public next():ItemIteration {
    const itemMetaIt = this._bufferIt.next(4);

    if (!itemMetaIt.done) {
      const metaBuffer = itemMetaIt.value;

      const typeCode = metaBuffer.readUInt16LE(0);
      checkItemType(typeCode);
      const dataLength = metaBuffer.readUInt16LE(2);

      let item:AddressItem|DataItem;

      switch (ItemType[typeCode]) {
        case 'ADDR_NULL':
        case 'CONNECTION_BASED':
        case 'SEQUENCED_ADDRESS':
          item = new AddressItem(typeCode, dataLength);
          break;
        case 'CONNECTED_TRANSPORT': // data item
        case 'UNCONNECTED_MESSAGE':
        case 'SOCKADDR_O2T':
        case 'SOCKADDR_T2O':
          item = new DataItem(typeCode, dataLength);
          break;
        // case 'DATA_LIST_IDENTITY':
        // case 'DATA_LIST_SERVICES':
        default:
          throw new Error(`Item with type <${ItemType[typeCode]}>,
          code <${typeCode} is not implemented yet`);
      }

      if (dataLength > 0) {
        const dataBuffer = this._bufferIt.next(dataLength).value;
        item.parseData(dataBuffer);
      }

      return {value: item, done: false};
    } else {
      return {value: undefined, done: true};
    }
  }
}
