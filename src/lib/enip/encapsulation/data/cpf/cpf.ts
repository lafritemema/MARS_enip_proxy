
interface CPFJSONObject extends Object{
  addressItem:object,
  dataItem:object,
  optionalItems:Object[],
  timeout:number,
}

import {BufferIterator} from '../../../utils/buffer_iterator';
import {CPFAddressItem, CPFDataItem, CPFItem} from './cpf_item';
/**
 * Class describing Common Packet Format
 * @class
 */
export class EnipCPF {
  private _addressItem:CPFAddressItem;
  private _dataItem:CPFDataItem;
  private _optionalItems:CPFItem[];
  private _timeout:number;

  /**
   * EnipCPF instance constructor
   * @param {CPFAddressItem} addressItem CPFAddressItem instance containing addressing informations
   * @param {CPFDataItem} dataItem CPFDataItem instance containing encapsulated data
   * @param {CPFItem} optionalItems list of other CPF items, default empty array
   * @param {number} timeout connection timeout, default 0
   */
  public constructor(addressItem:CPFAddressItem,
      dataItem:CPFDataItem,
      optionalItems:CPFItem[]=[],
      timeout:number=0) {
    this._addressItem= addressItem;
    this._dataItem= dataItem;
    this._optionalItems = optionalItems;
    this._timeout = timeout;
  }

  /**
     * Parse the Enip CPF buffer
     * @param {Buffer} buffer buffer describing the CPF
     * @return {Message} a EnipCPF instance
     */
  public static parse(buffer:Buffer) : EnipCPF {
    const buffIter = new BufferIterator(buffer);

    // parse the metadata
    // the interface handle on 4 bytes, shall be 0 for CIP
    const interfaceHandle = buffIter.next(4).value.readUInt32LE();
    // connection timeout on 2 bytes

    if (interfaceHandle!=0) {
      // eslint-disable-next-line max-len
      throw new Error(`ERROR : The CPF packet interface handle must be 0 for CIP protocol instead of ${interfaceHandle}.`);
    }

    const timeout = buffIter.next(2).value.readUInt16LE();
    // read the buffer first byte to get the item count
    const itemCount = buffIter.next(2).value.readUInt16LE();

    // parse the data
    // parse the 4 next byte to get the address item metadata
    const addressItem = CPFItem.parseMeta(buffIter.next(4).value);
    // parse the next X byte (address item data length) to get the data
    if (addressItem.group != 'ADDRESS') {
      // eslint-disable-next-line max-len
      throw new Error(`ERROR : The CPF packet first item must be an ADDRESS type item instead of ${addressItem.group}.`);
    }
    if (addressItem.dataLength > 0) {
      addressItem.parseData(buffIter.next(addressItem.dataLength).value);
    }

    // parse the 4 next byte to get the data item metadata
    const dataItem = CPFItem.parseMeta(buffIter.next(4).value);
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
        const item = CPFItem.parseMeta(itemBuff.value);

        if (item.dataLength>0) {
          item.parseData(buffIter.next(item.dataLength).value);
        }

        otherItem.push(item);
        itemBuff = buffIter.next(4);
      }
    }

    return new EnipCPF(<CPFAddressItem>addressItem,
      <CPFDataItem>dataItem,
      otherItem,
      timeout);
  }

  /**
   * Encode the CPF instance in a Buffer
   * @return {Buffer} a buffer describing CPF
   */
  public encode():Buffer {
    // encode metadata buffer : interface handle (4 bytes) + timeout (2 bytes) + cpf item nbr (2 bytes)
    const metadata = Buffer.alloc(8);
    // write interface handler on the first 4 bytes 0 for CIP
    metadata.writeUInt32LE(0);
    // write timeout on the next 2 bytes
    metadata.writeUInt16LE(this._timeout, 4);
    // write item nbr on the next 2 bytes : 2 + optionnal items
    metadata.writeUInt16LE(2 + this._optionalItems.length, 6);

    // encode informations about optionnal items if exists
    let optItemBuff = Buffer.alloc(0);
    if (this._optionalItems.length > 0) {
      for (const oi of this._optionalItems) {
        optItemBuff = Buffer.concat([optItemBuff, oi.encode()]);
      }
    }

    // return a Buffer metadata + addressitem + data item + optionnal items ...
    return Buffer.concat([metadata,
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
      timeout: this._timeout,
    };
  }
}
