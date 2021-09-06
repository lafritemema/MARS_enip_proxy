

import {AddressItem} from './item/address_item';
import {DataItem} from './item/data_item';
import {Item} from './item/item';
import {ItemIterator,
  ItemIteration} from './item/item_iterator';

export interface CPFJSONObject extends Object{
  addressItem:object,
  dataItem:object,
  optionalItems:Object[],
}

/**
 * Class describing Common Packet Format
 * @class
 */
export class EnipCPF {
  private _addressItem:AddressItem;
  private _dataItem:DataItem;
  private _optionalItems:Item[];

  /**
   * EnipCPF instance constructor
   * @param {AddressItem} addressItem AddressItem instance containing addressing informations
   * @param {DataItem} dataItem DataItem instance containing encapsulated data
   * @param {Item} optionalItems list of other CPF items, default empty array
   */
  public constructor(addressItem:AddressItem,
      dataItem:DataItem,
      optionalItems:Item[]=[]) {
    this._addressItem= addressItem;
    this._dataItem= dataItem;
    this._optionalItems = optionalItems;
  }

  /**
   * Get the CPF packet length in bytes
   * @return {number} CPF packet length
   */
  public get length() {
    const metadataLength = 2;
    if (this._optionalItems.length > 0) {
      let oilength:number = 0;
      for (const i of this._optionalItems) {
        oilength+=i.length;
      }
      return this._addressItem.length +
      this._dataItem.length +
      oilength +
      metadataLength;
    } else {
      return this._addressItem.length +
      this._dataItem.length +
      metadataLength;
    }
  }

  /**
     * Parse the Enip CPF buffer
     * @param {Buffer} cpfBuffer buffer describing the CPF
     * @return {EnipCPF} a EnipCPF instance
     */
  public static parse(cpfBuffer:Buffer) : EnipCPF {
    // const buffIter = new BufferIterator(buffer);

    // read the buffer first byte to get the item count
    const itemCount = cpfBuffer.readUInt16LE(0);
    checkItemCount(itemCount);

    const itemIt = new ItemIterator(cpfBuffer.slice(2));

    let iteration:ItemIteration= itemIt.next();
    let dataItem:DataItem;
    let addressItem:AddressItem;

    if (!iteration.done && iteration.value instanceof AddressItem) {
      addressItem = <AddressItem>iteration.value;
    } else {
      // eslint-disable-next-line max-len
      throw new Error(`ERROR : The CPF packet first item must be an AddressItem instance instead of ${typeof iteration}.`);
    }

    iteration = itemIt.next();
    if (!iteration.done && iteration.value instanceof DataItem) {
      dataItem = <DataItem>iteration.value;
    } else {
      // eslint-disable-next-line max-len
      throw new Error(`ERROR : The CPF packet second item must be an DataItem instance instead of ${typeof iteration}.`);
    }

    const otherItem = [];

    if (itemCount>2) {
      let item = itemIt.next();
      while (!item.done) {
        otherItem.push(item.value);
        item = itemIt.next();
      }
    }

    return new EnipCPF(<AddressItem>addressItem,
      <DataItem>dataItem,
      <Item[]>otherItem);
  }

  /**
   * Encode the CPF instance in a Buffer
   * @return {Buffer} a buffer describing CPF
   */
  public encode():Buffer {
    // write item nbr on the next 2 bytes : 2 + optionnal items
    const metadataBuff = Buffer.alloc(2);
    metadataBuff.writeUInt16LE(2 + this._optionalItems.length);

    // encode informations about optionnal items if exists
    let optItemBuff = Buffer.alloc(0);
    if (this._optionalItems.length > 0) {
      for (const oi of this._optionalItems) {
        optItemBuff = Buffer.concat([optItemBuff, oi.encode()]);
      }
    }

    // return a Buffer metadata + addressitem + data item + optionnal items ...
    return Buffer.concat([metadataBuff,
      this._addressItem.encode(),
      this._dataItem.encode(),
      optItemBuff]);
  }

  /**
   * Convert the EnipCPF instance to JSON
   * @return {object} a EnipCPF JSON representation
   */
  public toJSON():CPFJSONObject {
    const optObj = [];
    if (this._optionalItems.length>0) {
      for (const i of this._optionalItems) {
        optObj.push(i.toJSON());
      }
    }

    return {
      addressItem: this._addressItem.toJSON(),
      dataItem: this._dataItem.toJSON(),
      optionalItems: optObj,
    };
  }
}

/**
 * Check if the number on Item in CPF is conform
 * @param {number} itemCount number of item
 */
function checkItemCount(itemCount:number) {
  if (itemCount < 2 ) {
    // eslint-disable-next-line max-len
    throw new Error(`ERROR : The CPF packet must contains at least 2 items (address + data). Only ${itemCount} found.`);
  }
}
