import {Item} from './item';
import {ItemType, ItemTypeObject, ItemTypeKey} from './item_type';


/**
   * Parse the buffer describing the Item metadata
   * @param {Buffer} metaBuffer buffer describing the Item
   * @return {Item} a Item instance
   */
function parseMeta(metaBuffer:Buffer):Item {
  const typeCode = metaBuffer.readUInt16LE(0);
  const length = metaBuffer.readUInt16LE(2);
  // ENHANCE : integrate best optimized item type check
  checkItemType(typeCode);
  const itemClass = ItemTypeObject[<ItemTypeKey>ItemType[typeCode]];

  // ENHANCE : fix typescript error
  // @ts-ignore
  return createTypedInstance(itemClass, typeCode, length);
}

/**
 * Generic function to create a typed item instance from a metaBuffer
 * @param {class} i  typed item class
 * @param {number} type item type code
 * @param {number} length item data length
 * @return {Item} a typed item heritate from Item
*/
function createTypedInstance<I extends Item>(i: new() => I,
    type:number,
    length:number):I {
  // eslint-disable-next-line new-cap
  const typedItem = new i();
  typedItem.dataLength = length;
  typedItem.type=type;

  return typedItem;
}

/**
 * Check if the type code is conform
 * raise an Error if not
 * @param {number} typeCode code to check
 */
function checkItemType(typeCode:number):void {
  if (ItemType[typeCode] == undefined) {
    // eslint-disable-next-line max-len
    throw new Error(`ERROR: The Item type <${typeCode}> is not an available Item type`);
  }
}

export {parseMeta};
