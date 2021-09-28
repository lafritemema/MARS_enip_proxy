import Item, * as item from './item';

export interface CPFJSONObject extends Object{
  addressItem:item.AddressJSON,
  dataItem:item.DataJSON,
  optionalItems:object[],
}

/**
 * Class describing Common Packet Format
 * @class
 */
export class EnipCPF {
  private _addressItem:item.Address;
  private _dataItem:item.Data;
  private _optionalItems:Item[];

  /**
   * EnipCPF instance constructor
   * @param {AddressItem} addressItem AddressItem instance containing addressing informations
   * @param {DataItem} dataItem DataItem instance containing encapsulated data
   * @param {Item} optionalItems list of other CPF items, default empty array
   */
  public constructor(
      addressItem:item.Address,
      dataItem:item.Data,
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
   * get item containing data
   */
  public get dataItem() {
    return this._dataItem;
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

    const itemIt = new item.Iterator(cpfBuffer.slice(2));

    let iteration:item.Iteration= itemIt.next();
    let dataItem:item.Data;
    let addressItem:item.Address;

    if (!iteration.done && iteration.value instanceof item.Address) {
      addressItem = <item.Address>iteration.value;
    } else {
      // eslint-disable-next-line max-len
      throw new Error(`ERROR : The CPF packet first item must be an AddressItem instance instead of ${typeof iteration}.`);
    }

    iteration = itemIt.next();
    if (!iteration.done && iteration.value instanceof item.Data) {
      dataItem = <item.Data>iteration.value;
    } else {
      // eslint-disable-next-line max-len
      throw new Error(`ERROR : The CPF packet second item must be an DataItem instance instead of ${typeof iteration}.`);
    }

    const otherItem = [];

    if (itemCount>2) {
      let itemIteration:item.Iteration = itemIt.next();
      while (!itemIteration.done) {
        otherItem.push(itemIteration.value);
        itemIteration = itemIt.next();
      }
    }

    return new EnipCPF(<item.Address>addressItem,
      <item.Data>dataItem,
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

    const buffArray = [metadataBuff,
      this._addressItem.encode(),
      this._dataItem.encode()];

    // encode informations about optionnal items if exists

    if (this._optionalItems.length > 0) {
      for (const oi of this._optionalItems) {
        // @ts-ignore
        buffArray.push(oi.encode());
      }
    }
    // return a Buffer metadata + addressitem + data item + optionnal items ...
    return Buffer.concat(buffArray);
  }

  /**
   * Convert the EnipCPF instance to JSON
   * @return {object} a EnipCPF JSON representation
   */
  public toJSON():CPFJSONObject {
    const optObj = [];
    if (this._optionalItems.length>0) {
      for (const i of this._optionalItems) {
        // @ts-ignore
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
