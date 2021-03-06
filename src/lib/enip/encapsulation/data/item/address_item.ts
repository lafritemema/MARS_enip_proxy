import {Item, ItemInterface} from './item';
import {ItemType} from './item_type';
import {BufferIterator} from 'utils';

export interface AddressItemJSONObject extends Object {
  itemType:string,
  length: number,
  connectionId?:number,
  sequenceNbr?:number,
}

/**
 * Class describing an Common Packet Format address item
 */
export class AddressItem extends Item implements ItemInterface {
  private _data : number[];

  /**
   * AddressItem instance constructor
   * @param {number} addressTypeCode CPF item type code
   * @param {number} length CPF item lenght in byte
   * @param {number[]} data connection identifier[+sequence nbr] if needed default empty Array
   */
  public constructor(addressTypeCode:number=ItemType.ADDR_NULL,
      length:number=0,
      data:number[]=[]) {
    super(addressTypeCode, length);
    this._data = data;
  }


  /**
   * Convert the AdressItem instance to JSON
   * @return {object} a AdressItem JSON representation
   */
  public toJSON(): AddressItemJSONObject {
    const jsonObj:AddressItemJSONObject= {
      itemType: ItemType[this._type],
      length: this.length,
    };
    if (this._data[0]) jsonObj['connectionId'] = this._data[0];
    if (this._data[1]) jsonObj['sequenceNbr'] = this._data[1];

    return jsonObj;
  }

  /**
   * Encode the Address Item instance to Buffer
   * @return {Buffer} data frame describing the address item
   */
  public encode(): Buffer {
    // metabuffer size 4 bytes => <item type, data length>
    const metaBuffer = Buffer.alloc(4);
    metaBuffer.writeUInt8(this._type, 0);
    metaBuffer.writeUInt8(this._dataLength, 2);

    // databuffer size 4 byte x nb element in this._data
    const dataBuffer = Buffer.alloc(this._dataLength);

    let pointer = 0;
    for (const d of this._data) {
      dataBuffer.writeUInt32LE(d, pointer);
      pointer+=4;
    }

    return Buffer.concat([metaBuffer, dataBuffer]);
  }

  /**
   * Parse a buffer describing the CPF Address Item
   * @param {Buffer} dataBuffer buffer describing the CPF Address Item
   */
  public parseData(dataBuffer:Buffer) : void {
    const data=[];
    const buffIt = new BufferIterator(dataBuffer);

    // each element of address item data is size 4 byte
    // extract the first 4 bytes of dataBuffer using the bufferIterator
    let buffItEl = buffIt.next(4);

    while (!buffItEl.done) {
      data.push(buffItEl.value.readUInt32LE());
      buffItEl = buffIt.next(4);
    }

    this._dataLength = dataBuffer.length;
    this._data = data;
  }

  /**
   * Get the item type under string format
   * @return {string} item type
   */
  public getType():string {
    return ItemType[this._type];
  }
}

