import {BufferIterator} from 'utils';
import {Item} from './item';
import {buildTypedItem} from './item_type';


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
      const typedItem = buildTypedItem(metaBuffer);

      if (typedItem.dataLength > 0) {
        const dataBuffer = this._bufferIt.next(typedItem.dataLength).value;
        typedItem.parseData(dataBuffer);
      }

      return {value: typedItem, done: false};
    } else {
      return {value: undefined, done: true};
    }
  }
}


