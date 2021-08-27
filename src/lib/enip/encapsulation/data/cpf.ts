
export interface CPFJSONObject extends Object{
  addressItem:object,
  dataItem:object,
  optionalItems:Object[],
}

import {BufferIterator} from '../../../utils/buffer_iterator';
import {Item} from './item/item';
import {AddressItem} from './item/address_item';
import {DataItem} from './item/data_item';
import * as ITEM from './item';
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
     * @param {Buffer} buffer buffer describing the CPF
     * @return {Message} a EnipCPF instance
     */
  public static parse(buffer:Buffer) : EnipCPF {
    const buffIter = new BufferIterator(buffer);

    // read the buffer first byte to get the item count
    const itemCount = buffIter.next(2).value.readUInt16LE();

    // parse the data
    // parse the 4 next byte to get the address item metadata
    const addressItem = ITEM.parseMeta(buffIter.next(4).value);
    // parse the next X byte (address item data length) to get the data
    if (addressItem.group != 'ADDRESS') {
      // eslint-disable-next-line max-len
      throw new Error(`ERROR : The CPF packet first item must be an ADDRESS type item instead of ${addressItem.group}.`);
    }
    if (addressItem.dataLength > 0) {
      addressItem.parseData(buffIter.next(addressItem.dataLength).value);
    }

    // parse the 4 next byte to get the data item metadata
    const dataItem = ITEM.parseMeta(buffIter.next(4).value);
    // parse the next X byte (address item data length) to get the data
    dataItem.parseData(buffIter.next(dataItem.dataLength).value);

    if (dataItem.group != 'DATA') {
      // eslint-disable-next-line max-len
      throw new Error(`ERROR : The CPF packet second item must be an DATA type item instead of ${dataItem.group}.`);
    }

    // if other item exist, parse the other in the same way as previously
    const otherItem = [];
    if (itemCount > 2) {
      let itemBuff = buffIter.next(4);

      while (!itemBuff.done) {
        const item = ITEM.parseMeta(itemBuff.value);

        if (item.dataLength>0) {
          item.parseData(buffIter.next(item.dataLength).value);
        }

        otherItem.push(item);
        itemBuff = buffIter.next(4);
      }
    }

    return new EnipCPF(<AddressItem>addressItem,
      <DataItem>dataItem,
      otherItem);
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
