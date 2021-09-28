import * as cip from 'cip';
import {BufferIterator} from 'utils';
import {Item, ItemInterface} from './item';
import {ItemType} from './item_type';
import {SocketAddrItem,
  SocketAddrItemDataJSONObject} from './socketaddr_item';

export interface ListIdentityItemJSONObjet extends Object {
  identity:cip.identity.IdentityJSON;
  socketAddress : SocketAddrItemDataJSONObject;
  protocol:number;
}

/**
 * Class describing the list
 */
export class ListIdentityItem extends Item implements ItemInterface {
  private _encProtocol:number=1;
  private _socketAddress:SocketAddrItem;
  private _identity:cip.Identity;

  /**
   * ListIdentityItem instance constructor
   * @param {Identity} identity Identity object instance describing the device identity
   * @param {SocketAddrItem} socketAddress SocketAddress Item instance describing the communication socket information
   */
  constructor(identity:cip.Identity,
      socketAddress:SocketAddrItem) {
    super(ItemType.LIST_IDENTITY,
        identity.length + socketAddress.dataLength + 2);
    this._socketAddress = socketAddress;
    this._identity = identity;
  }

  /**
   * Get the identity object
   */
  public get identity():cip.identity.IdentityJSON {
    return this._identity.toJSON();
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
    const identity = cip.Identity.parse(identityBuffer);

    return new ListIdentityItem(
        identity,
        socketAddress);
  }

  /**
   * Parse the buffer describing the ListIdentityItem data
   * @param {Buffer} dataBuffer buffer describing the Identity object
   */
  public parseData(dataBuffer:Buffer):void {
    this._dataLength = dataBuffer.length;
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
    const identity = cip.Identity.parse(identityBuffer);

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
    metaBuffer.writeUInt16LE(this._dataLength, 2);

    const protocolBuffer = Buffer.alloc(2);
    protocolBuffer.writeUInt16LE(this._encProtocol);

    const socketAddrBuffer = this._socketAddress.encodeData();
    const identityBuffer = this._identity.encode();

    return Buffer.concat([
      metaBuffer,
      protocolBuffer,
      socketAddrBuffer,
      identityBuffer]);
  }

  /**
   * Convert the ListIdentityItem instance to JSON
   * @return {object} a ListIdentityItem JSON representation
   */
  public toJSON():ListIdentityItemJSONObjet {
    return {
      identity: this._identity.toJSON(),
      socketAddress: this._socketAddress.dataToJSON(),
      protocol: this._encProtocol,
    };
  }

  /**
   * Get the item type under string format
   * @return {string} item type
   */
  public getType():string {
    return ItemType[this._type];
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
  if (typeCode != ItemType.LIST_IDENTITY) {
    // eslint-disable-next-line max-len
    throw new Error(`ERROR: The list identity item type code <${typeCode}> is not conform.
    expected ${ItemType.LIST_IDENTITY}`);
  }
}
