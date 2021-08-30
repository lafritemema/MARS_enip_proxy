import {BufferIterator} from '../../../../utils/buffer_iterator';
import {Item} from './item';
import {checkItemType,
  ItemType,
  ItemTypeObject,
  ItemTypeKey} from './item_type';


interface ItemIteratorObject {
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
   * @return {ItemIteratorObject} object containing the next item if exist
   */
  public next():ItemIteratorObject {
    const itemMetaIt = this._bufferIt.next(4);
    console.log(itemMetaIt.value);
    if (!itemMetaIt.done) {
      const itemType = itemMetaIt.value.readUInt16LE(0);
      checkItemType(itemType);
      const dataLength = itemMetaIt.value.readUInt16LE(2);

      const itemTypeObj = ItemTypeObject[<ItemTypeKey>ItemType[itemType]];
      // @ts-ignore
      const typedItem = createTypedInstance(itemTypeObj);

      if (dataLength > 0) {
        const dataBuffer = this._bufferIt.next(dataLength).value;
        typedItem.parseData(dataBuffer);
      }

      return {value: typedItem, done: false};
    } else {
      return {value: undefined, done: true};
    }
  }
}

/**
 * Generic function to create a typed item instance from a metaBuffer
 * @param {class} i  typed item class
 * @param {number} type item type code
 * @param {number} length item data length
 * @return {Item} a typed item heritate from Item
*/
function createTypedInstance<I extends Item>(i: new() => I):I {
  // eslint-disable-next-line new-cap
  const typedItem = new i();
  return typedItem;
}
