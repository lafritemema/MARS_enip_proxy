import {IdentityObject,
  IdentityJSONObject} from '../../../../cip/identity/identity_object';
import {BufferIterator} from '../../../../utils/buffer_iterator';
import {Item} from './item';
import {ItemType} from './item_type';
import {SocketAddrItem,
  SocketAddrItemDataJSONObject} from './socketaddr_item';

export interface ListIdentityItemJSONObjet extends Object {
  identity:IdentityJSONObject;
  socketAddress : SocketAddrItemDataJSONObject;
  protocol:number;
}

/**
 * Class describing the list
 */
export class ListIdentityItem extends Item {
  private _encProtocol:number=1;
  private _socketAddress:SocketAddrItem;
  private _identity:IdentityObject;

  /**
   * ListIdentityItem instance constructor
   * @param {number} dataLength length of Identity Item data
   * @param {IdentityObject} identity Identity object instance describing the device identity
   * @param {SocketAddrItem} socketAddress SocketAddress Item instance describing the communication socket information
   */
  constructor(dataLength:number,
      identity:IdentityObject,
      socketAddress:SocketAddrItem) {
    super(ItemType.DATA_LIST_IDENTITY, dataLength);
    this._socketAddress = socketAddress;
    this._identity = identity;
  }

  /**
   * Parse the buffer describing the ListIdentity Item
   * @param {Buffer} listIdentityItemBuff buffer describing the Identity object
   * @return {ListIdentityItem} a ListIdentityItem instance
   */
  public static parse(listIdentityItemBuff:Buffer):ListIdentityItem {
    const buffIt = new BufferIterator(listIdentityItemBuff);
    const typeCode = buffIt.next(2).value.readUInt16LE();
    const dataLength = buffIt.next(2).value.readUInt16LE();
    const encProtocol = buffIt.next(2).value.readUInt16LE();

    checkEncapsulationProtocol(encProtocol);
    checkTypeCode(typeCode);

    const socketAddrBuffer = buffIt.next(16).value;
    const socketAddress = new SocketAddrItem();
    socketAddress.parseData(socketAddrBuffer);

    // get the identityItem buffer
    // => next X bytes where X = length of ListIdentityItem - length of socketaddr data - 2 byte for enc protocol
    const identityBuffer = buffIt.next(
        dataLength - socketAddress.dataLength - 2).value;
    const identity = IdentityObject.parse(identityBuffer);

    return new ListIdentityItem(dataLength,
        identity,
        socketAddress);
  }

  /**
   * Parse the buffer describing the ListIdentityItem data
   * @param {Buffer} dataBuffer buffer describing the Identity object
   */
  public parseData(dataBuffer:Buffer):void {
    const buffIt = new BufferIterator(dataBuffer);
    // get the protocol : first 2 bytes
    const encProtocol = buffIt.next(2).value.readUInt16LE();

    // get the socketAddr next 16 bytes
    const socketAddrBuffer = buffIt.next(16).value;
    const socketAddress = new SocketAddrItem();
    socketAddress.parseData(socketAddrBuffer);

    // get the identityItem buffer
    // => next X bytes where X = length of ListIdentityItem - length of socketaddr data - 2 byte for enc protocol
    const identityBuffer = buffIt.next(
        this.dataLength - socketAddress.dataLength - 2).value;
    const identity = IdentityObject.parse(identityBuffer);

    this._encProtocol = encProtocol;
    this._socketAddress = socketAddress;
    this._identity = identity;
  }

  /**
   * Encode the ListIdentity Item instance to Buffer
   * @return {Buffer} datagram describing the ListIdentity Item
   */
  public encode():Buffer {
    const metaBuffer = Buffer.alloc(4);
    metaBuffer.writeUInt16LE(this.type, 0);
    metaBuffer.writeUInt16LE(this.length, 2);

    const socketAddrBuffer = this._socketAddress.encode();
    const identityBuffer = this._identity.encode();

    return Buffer.concat([metaBuffer, socketAddrBuffer, identityBuffer]);
  }

  /**
   * Convert the ListIdentityItem instance to JSON
   * @return {object} a ListIdentityItem JSON representation
   */
  public toJSON():ListIdentityItemJSONObjet {
    return {
      identity: this._identity.toJSON(),
      socketAddress: this._socketAddress.toJSON(),
      protocol: this._encProtocol,
    };
  }
}

/**
 * Check if the listIdentity item encapsulation protocol is conform
 * @param {number} encProtocol encapsulation protocol code
 */
function checkEncapsulationProtocol(encProtocol:number) {
  if (encProtocol != 1) {
    // eslint-disable-next-line max-len
    throw new Error(`ERROR: The list identity item encpasulation protocol <${encProtocol}> is not conform. expected 1`);
  }
}

/**
 * Check if the listIdentity item type code is conform
 * @param {number} typeCode istIdentity item type code
 */
function checkTypeCode(typeCode:number) {
  if (typeCode != ItemType.DATA_LIST_IDENTITY) {
    // eslint-disable-next-line max-len
    throw new Error(`ERROR: The list identity item type code <${typeCode}> is not conform.
    expected ${ItemType.DATA_LIST_IDENTITY}`);
  }
}
