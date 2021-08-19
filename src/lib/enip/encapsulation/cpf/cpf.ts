

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

  /**
   * EnipCPF instance constructor
   * @param {CPFAddressItem} addressItem CPFAddressItem instance containing addressing informations
   * @param {CPFDataItem} dataItem CPFDataItem instance containing encapsulated data
   * @param {CPFItem} optionalItems list of other CPF items, default empty array
   */
  public constructor(addressItem:CPFAddressItem,
      dataItem:CPFDataItem,
      optionalItems:CPFItem[]=[]) {
    this._addressItem= addressItem;
    this._dataItem= dataItem;
    this._optionalItems = optionalItems;
  }

  /**
     * Parse the Enip CPF buffer
     * @param {Buffer} buffer buffer describing the CPF
     * @return {Message} a EnipCPF instance
     */
  public static parse(buffer:Buffer) : EnipCPF {
    const buffIter = new BufferIterator(buffer);

    // read the buffer first byte to get the item count
    const itemCount = buffIter.next().value.readUInt8();

    // parse the 2 next byte to get the address item metadata
    const addressItem = CPFItem.parseMeta(buffIter.next(2).value);
    // parse the next X byte (address item data length) to get the data
    if (addressItem.group != 'ADDRESS') {
      // eslint-disable-next-line max-len
      throw new Error(`ERROR : The CPF packet first item must be an ADDRESS type item instead of ${addressItem.group}.`);
    }
    if (addressItem.dataLength > 0) {
      addressItem.parseData(buffIter.next(addressItem.dataLength).value);
    }

    // parse the 2 next byte to get the data item metadata
    const dataItem = CPFItem.parseMeta(buffIter.next(2).value);
    // parse the next X byte (address item data length) to get the data
    dataItem.parseData(buffIter.next(dataItem.dataLength).value);
    if (dataItem.group != 'DATA') {
      // eslint-disable-next-line max-len
      throw new Error(`ERROR : The CPF packet second item must be an DATA type item instead of ${dataItem.group}.`);
    }

    // if other item exist, parse the other in the same way as previously
    const otherItem = [];
    if (itemCount > 2) {
      let itemBuff = buffIter.next(2);

      while (!itemBuff.done) {
        const item = CPFItem.parseMeta(itemBuff.value);

        if (item.dataLength>0) {
          item.parseData(buffIter.next(item.dataLength).value);
        }

        otherItem.push(item);
        itemBuff = buffIter.next(2);
      }
    }

    return new EnipCPF(<CPFAddressItem>addressItem,
      <CPFDataItem>dataItem,
      otherItem);
  }

  /**
   * Encode the CPF instance in a Buffer
   * @return {Buffer} a buffer describing CPF
   */
  public encode():Buffer {
    // encode metadata with number of item (2)
    const metadata = Buffer.from([2]);

    //return a Buffer metadata + addressitem + data item
    // ENHANCE : integrate other items if needed ...
    return Buffer.concat([metadata,
      this._addressItem.encode(),
      this._dataItem.encode()]);
  }
}
