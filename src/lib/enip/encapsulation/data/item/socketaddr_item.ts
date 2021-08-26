import {ItemType} from './item_type';
import {convertIp2Num, convertNum2Ip} from '../../../../utils/convertor';
import {BufferIterator} from '../../../../utils/buffer_iterator';
import {Item} from './item';

export interface SocketAddrItemDataJSONObject extends Object {
  sinFamilly:number;
  sinAddress:string;
  sinPort:number;
  sinZero:number[];
}
interface SocketAddrItemJSONObject extends SocketAddrItemDataJSONObject {
  itemType:string,
  length: number,
}

/**
 * Class describing a SocketAddr Item
 */
export class SocketAddrItem extends Item {
  private _sinFamilly:number=2;
  private _sinPort:number;
  private _sinAddr:number;
  private _sinZero:number[]=Array(8).fill(0);

  /**
   * SocketAddrItem constructor
   * @param {number|string} sinAddr IP address in string or num format
   * @param {number} typeCode item type code for SocketAddr
   * DATA_SOCKADDR_O2T (0X8000) or DATA_SOCKADDR_T2O (0X8001)
   * default DATA_SOCKADDR_O2T
   * @param {number} sinPort cummounication port number, default 44818
   */
  constructor(sinAddr:number|string=0,
      typeCode:number=ItemType.DATA_SOCKADDR_O2T,
      sinPort:number=44818) {
    super(typeCode, 16);
    checkSocketAddrTypeCode(typeCode);
    this._sinPort = sinPort;

    if (typeof sinAddr == 'string') {
      this._sinAddr = convertIp2Num(sinAddr);
    } else {
      this._sinAddr = sinAddr;
    }
  }

  /**
   * Parse a buffer describing the SocketAddr item data
   * @param {Buffer} dataBuffer buffer describing the SocketAddr item data
   */
  public parseData(dataBuffer:Buffer):void {
    const buffIt = new BufferIterator(dataBuffer);
    const sinFamilly = buffIt.next(2).value.readInt16BE();
    const sinPort = buffIt.next(2).value.readUInt16BE();
    const sinAddr = buffIt.next(4).value.readUInt32BE();

    // ENHANCE : not Bing Endian read but normally each number is 0
    const sinZero = Array.from(buffIt.next(8).value);

    checkSinFamilly(sinFamilly);
    checkSinZero(sinZero);
    checkSinAddress(sinAddr);

    this._sinPort = sinPort;
    this._sinAddr = sinAddr;
    this._sinFamilly = sinFamilly;
    this._sinZero = sinZero;
  }

  /**
   * Encode the SocketAddr Item instance to Buffer
   * @return {Buffer} datagram describing the SocketAddr Item
   */
  public encode():Buffer {
    const dataBuffer = this.encodeData();

    const metaBuffer = Buffer.alloc(4);
    metaBuffer.writeUInt16LE(this._type, 0);
    metaBuffer.writeUInt16LE(dataBuffer.length, 2);

    return Buffer.concat([metaBuffer, dataBuffer]);
  }

  /**
   * Encode only the SocketAddr Item instance data to Buffer
   * to encoding all SocketAddress Item use encode() function instead
   * @return {Buffer} datagram describing the SocketAddr Item data
   */
  public encodeData():Buffer {
    const socketBuff = Buffer.alloc(8);
    socketBuff.writeInt16BE(this._sinFamilly, 0);
    socketBuff.writeUInt16BE(this._sinPort, 2);
    socketBuff.writeUInt32BE(this._sinAddr, 4);

    // ENHANCE : not Bing Endian write but normally each number is 0
    const zeroBuffer = Buffer.from(this._sinZero);

    return Buffer.concat([socketBuff, zeroBuffer]);
  }

  /**
   * Convert the SocketAddr instance to JSON
   * @return {object} a SocketAddr JSON representation
   */
  public toJSON():SocketAddrItemJSONObject {
    const socketJson = <SocketAddrItemJSONObject> this.dataToJSON();
    socketJson['itemType'] = ItemType[this._type];
    socketJson['length'] = this.length;

    return socketJson;
  }

  /**
   * Convert the data of SocketAddr instance to JSON
   * @return {object} JSON representation of data of SocketAddr instance
   */
  public dataToJSON() : SocketAddrItemDataJSONObject {
    return {
      sinFamilly: this._sinFamilly,
      sinPort: this._sinPort,
      sinAddress: convertNum2Ip(this._sinAddr),
      sinZero: this._sinZero,
    };
  }
}

/**
 * Check if the item type code is a SocketAddr type code
 * @param {number} typeCode item type code to check
 */
function checkSocketAddrTypeCode(typeCode:number):void {
  if (typeCode != ItemType.DATA_SOCKADDR_O2T &&
    typeCode != ItemType.DATA_SOCKADDR_T2O) {
    // eslint-disable-next-line max-len
    throw new Error(`ERROR: The Item type <${typeCode}> is not an available SocketAddr Item type`);
  }
}

/**
 * Check if the sin familly number is conform
 * @param {number} sinFamilly the sin familly number to check
 */
function checkSinFamilly(sinFamilly:number) {
  if (sinFamilly != 2) {
    // eslint-disable-next-line max-len
    throw new Error(`ERROR: The SocketAddr sin familly <${sinFamilly}> is not conform, must be 2.`);
  }
}

/**
 * Check if the sin zero array is conform
 * @param {number[]} sinZero the sin zero array to check
 */
function checkSinZero(sinZero:number[]) {
  if (sinZero != Array(8).fill(0)) {
    // eslint-disable-next-line max-len
    throw new Error(`ERROR: The SocketAddr sin zero <${sinZero}> is not conform, must be 0.`);
  }
}

/**
 * Check if the sin address number is conform
 * @param {number} sinAddress the sin address to check
 */
function checkSinAddress(sinAddress:number) {
  // eslint-disable-next-line max-len
  const maxSinAddr = Buffer.from([255, 255, 255, 255]).readUInt32BE();
  if (sinAddress > maxSinAddr) {
    // eslint-disable-next-line max-len
    throw new Error(`ERROR: The SocketAddr sin address <${sinAddress}> is not conform, must be lower than ${maxSinAddr}.`);
  }
}
