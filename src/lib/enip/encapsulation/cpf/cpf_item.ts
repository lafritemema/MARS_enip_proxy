import {CPFItemType} from './item_type';
import {Message as CIPMessage} from '../../../cip/message/message';
import {BufferIterator} from '../../../utils/buffer_iterator';
/**
 * Class describing an Common Packet Format item
 */
export abstract class CPFItem {
  protected _type : number;
  protected _dataLength :number;

  /**
   * CPFItem instance constructor
   * @param {number} type CPF item type code
   * @param {number} dataLength CPFItem length in bytes
   * @protected
   */
  protected constructor(type:number, dataLength:number) {
    this._type = type;
    this._dataLength = dataLength;
  }

  /**
   * Get the CPFItem length in bytes
   * @return {number} CPFItem length
   */
  public get length() : number {
    // data length + metadata length (typeid + length)
    return this._dataLength + 2;
  }

  /**
   * Get the CPFItem data length in bytes
   * @return {number} CPFItem data length
   */
  public get dataLength() : number {
    return this._dataLength;
  }

  /**
   * Get the group of item type (DATA or ADDRESS)
   * @return {string} item group (DATA or ADDRESS)
   */
  public get group() : string {
    const group = CPFItemType[this._type].substr(0, 4);
    return group =='DATA'? 'DATA' : 'ADDRESS';
  }

  /**
   * Parse the buffer describing the CPFItem metadata
   * @param {Buffer} metaBuffer buffer describing the CPFItem
   * @return {CPFItem} a CPFItem instance
   */
  public static parseMeta(metaBuffer:Buffer):CPFItem {
    const type = metaBuffer.readUInt8(0);
    const length = metaBuffer.readUInt8(1);

    const strType = CPFItemType[type];

    if (strType!=undefined) {
      return strType.substr(0, 4)=='DATA' ?
        new CPFDataItem(type, length) :
        new CPFAddressItem(type, length);
    } else {
      // eslint-disable-next-line max-len
      throw new Error(`ERROR: The CPFItem type <${type}> is not an available CPFItem type`);
    }
  }

  public abstract toJSON():object;
  public abstract encode():Buffer;
  public abstract parseData(buffer:Buffer):void;
}


interface AddressItemJSONObject extends Object {
  itemType:string,
  connectionId?:number,
  sequenceNbr?:number
}

/**
 * Class describing an Common Packet Format address item
 */
export class CPFAddressItem extends CPFItem {
  private _data : number[];

  /**
   * CPFAddressItem instance constructor
   * @param {number} addressTypeCode CPF item type code
   * @param {number} length CPF item lenght in byte
   * @param {number[]} data connection identifier[+sequence nbr] if needed default empty Array
   */
  public constructor(addressTypeCode:number, length:number, data:number[]=[]) {
    super(addressTypeCode, length);
    this._data = data;
  }

  /**
   * Build an Null CPF Address Item
   * @return {CPFAddressItem} specific Address item instance
   */
  public static buildNullAddressItem():CPFAddressItem {
    return new CPFAddressItem(CPFItemType.ADDR_NULL, 2);
  }

  /**
   * Build an connected based CPF Address Item
   * @param {number} connectionId connection identifier
   * @return {CPFAddressItem} specific Address item instance
   */
  public static buildConnectedAddressItem(connectionId:number):CPFAddressItem {
    return new CPFAddressItem(CPFItemType.ADDR_CONNECTION_BASED, 4+2,
        [connectionId]);
  }

  /**
   * Build an connected based CPF Address Item
   * @param {number} connectionId connection identifier
   * @param {number} sequenceNbr sequence number
   * @return {CPFAddressItem} specific Address item instance
   */
  public static buildSequencedAddressItem(connectionId:number,
      sequenceNbr:number) {
    return new CPFAddressItem(CPFItemType.ADDR_SEQUENCED_ADDRESS, 8+2,
        [connectionId, sequenceNbr]);
  }

  /**
   * Convert the AdressItem instance to JSON
   * @return {object} a AdressItem JSON representation
   */
  public toJSON(): AddressItemJSONObject {
    const jsonObj:AddressItemJSONObject= {
      'itemType': CPFItemType[this._type],
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
    // metabuffer size 2 bytes => <item type, data length>
    const metaBuffer = Buffer.alloc(2);
    metaBuffer.writeUInt8(this._type, 0);
    metaBuffer.writeUInt8(this._data.length * 4, 1);

    // databuffer size 4 byte x nb element in this._data
    const dataBuffer = Buffer.alloc(this._data.length * 4);

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

    this._data = data;
  }
}

interface dataItemJSONObject extends Object {
  itemType:string,
  data:object|null
}

/**
 * Class describing an Common Packet Format data item
 */
export class CPFDataItem extends CPFItem {
  private _data:CIPMessage|undefined;

  /**
   * CPFDataItem instance constructor
   * @param {number} dataTypeCode CPF item type code
   * @param {number} dataLength CIP Message length in byte
   * @param {Message} data a CIP Message instance describing the data
   */
  public constructor(dataTypeCode:number, dataLength:number, data?:CIPMessage) {
    super(dataTypeCode, dataLength);
    this._data = data;
  }

  /**
   * Build an Unconnected Data Item
   * @param {Message} data a CIP Message instance describing the data
   * @return {CPFDataItem} specific Data item instance
   */
  public static buildUnconnectedDataItem(data:CIPMessage) : CPFDataItem {
    return new CPFDataItem(CPFItemType.DATA_UNCONNECTED_MESSAGE, data.length,
        data);
  }

  /**
   * Build an Unconnected Data Item
   * @param {Message} data a CIP Message instance describing the data
   * @return {CPFDataItem} specific Data item instance
   */
  public static buildConnectedDataItem(data:CIPMessage) : CPFDataItem {
    return new CPFDataItem(CPFItemType.DATA_CONNECTED_TRANSPORT, data.length,
        data);
  }

  // ENHANCE: integrate sockaddr info item

  /**
   * Convert the DataItem instance to JSON
   * @return {object} a DataItem JSON representation
   */
  public toJSON():dataItemJSONObject {
    return {
      itemType: CPFItemType[this._type],
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
    // metabuffer size 2 bytes => <item type, data length>
    const metaBuffer = Buffer.alloc(2);
    metaBuffer.writeUInt8(this._type, 0);
    metaBuffer.writeUInt8(dataBuffer.length, 1);

    return Buffer.concat([metaBuffer, dataBuffer]);
  }

  /**
   * Parse a buffer describing the CPF data Item
   * @param {Buffer} dataBuffer buffer describing the CPF Address Item
   */
  public parseData(dataBuffer:Buffer):void {
    const cipMessage = CIPMessage.parse(dataBuffer);
    this._data = cipMessage;
  }
}


