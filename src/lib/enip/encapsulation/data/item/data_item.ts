import {ItemType} from './item_type';
import {Message as CIPMessage} from '../../../../cip/message/message';
// import {BufferIterator} from '../../../../utils/buffer_iterator';
import {Item} from './item';

interface dataItemJSONObject extends Object {
  itemType:string,
  length:number,
  data:object|null
}

/**
 * Class describing an Common Packet Format data item
 */
export class DataItem extends Item {
  private _data:CIPMessage|undefined;

  /**
   * DataItem instance constructor
   * @param {number} dataTypeCode CPF item type code default (DATA_UNCONNECTED_MESSAGE)
   * @param {number} dataLength CIP Message length in byte, default 0
   * @param {Message} data a CIP Message instance describing the data
   */
  public constructor(dataTypeCode:number=ItemType.DATA_UNCONNECTED_MESSAGE,
      dataLength:number=0,
      data?:CIPMessage) {
    super(dataTypeCode, dataLength);
    this._data = data;
  }

  /**
   * Build an Unconnected Data Item
   * @param {Message} data a CIP Message instance describing the data
   * @return {DataItem} specific Data item instance
   */
  public static buildUnconnectedDataItem(data:CIPMessage) : DataItem {
    return new DataItem(ItemType.DATA_UNCONNECTED_MESSAGE, data.length,
        data);
  }

  /**
   * Build an Unconnected Data Item
   * @param {Message} data a CIP Message instance describing the data
   * @return {DataItem} specific Data item instance
   */
  public static buildConnectedDataItem(data:CIPMessage) : DataItem {
    return new DataItem(ItemType.DATA_CONNECTED_TRANSPORT, data.length,
        data);
  }

  // ENHANCE: integrate sockaddr info item

  /**
   * Convert the DataItem instance to JSON
   * @return {object} a DataItem JSON representation
   */
  public toJSON():dataItemJSONObject {
    return {
      itemType: ItemType[this._type],
      length: this.length,
      data: this._data ? this._data.toJSON() : null,
    };
  }

  /**
   * Encode the Data Item instance to Buffer
   * @return {Buffer} data frame describing the address item
   */
  public encode():Buffer {
    // dataBuffer = encoded CIP message
    if (this._data==undefined) {
      // eslint-disable-next-line max-len
      throw new Error('ERROR: The CPF data item is not conform. Encoding is impossible.');
    }

    const dataBuffer = this._data.encode();
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
    this._data = cipMessage;
  }

  /**
   * Get the group of item type
   * @return {string} item group
   */
  public get group() : string {
    return 'DATA';
  }
}
