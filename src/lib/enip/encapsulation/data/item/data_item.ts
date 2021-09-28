import {ItemType} from './item_type';
import {CIPMessage} from 'cip';
import {Item, ItemInterface} from './item';

export interface dataItemJSONObject extends Object {
  itemType:string,
  length:number,
  data:object|null
}

/**
 * Class describing an Common Packet Format data item
 */
export class DataItem extends Item implements ItemInterface {
  private _message:CIPMessage|undefined;

  /**
   * DataItem instance constructor
   * @param {number} dataTypeCode CPF item type code default (DATA_UNCONNECTED_MESSAGE)
   * @param {number} dataLength CIP Message length in byte, default 0
   * @param {Message} message a CIP Message instance describing the data
   */
  public constructor(dataTypeCode:number=ItemType.UNCONNECTED_MESSAGE,
      dataLength:number=0,
      message?:CIPMessage) {
    super(dataTypeCode, dataLength);
    this._message = message;
  }


  /**
   * get item message data
   */
  public get message():CIPMessage|undefined {
    return this._message;
  }

  /**
   * Convert the DataItem instance to JSON
   * @return {object} a DataItem JSON representation
   */
  public toJSON():dataItemJSONObject {
    return {
      itemType: ItemType[this._type],
      length: this.length,
      data: this._message ? this._message.toJSON() : null,
    };
  }

  /**
   * Encode the Data Item instance to Buffer
   * @return {Buffer} data frame describing the address item
   */
  public encode():Buffer {
    // dataBuffer = encoded CIP message
    if (this._message==undefined) {
      // eslint-disable-next-line max-len
      throw new Error('ERROR: The CPF data item is not conform. Encoding is impossible.');
    }

    const dataBuffer = this._message.encode();
    // metabuffer size 4 bytes => <item type (2 bytes), data length (2 bytes)>
    const metaBuffer = Buffer.alloc(4);
    metaBuffer.writeUInt16LE(this._type, 0);
    metaBuffer.writeUInt16LE(dataBuffer.length, 2);

    return Buffer.concat([metaBuffer, dataBuffer]);
  }

  /**
   * Parse a buffer describing the CPF data Item
   * @param {Buffer} dataBuffer buffer describing the CPF Address Item
   */
  public parseData(dataBuffer:Buffer):void {
    this._dataLength = dataBuffer.length;
    const cipMessage = CIPMessage.parse(dataBuffer);
    this._message = cipMessage;
  }

  /**
   * Get the item type under string format
   * @return {string} item type
   */
  public getType():string {
    return ItemType[this._type];
  }
}
