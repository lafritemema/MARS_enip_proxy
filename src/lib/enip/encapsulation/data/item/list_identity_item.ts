import {IdentityObject,
  IdentityJSONObject} from '../../../../cip/identity/identity_object';
import {BufferIterator} from '../../../../utils/buffer_iterator';
import {Item} from './item';
import {ItemType} from './item_type';
import {SocketAddrItem,
  SocketAddrItemDataJSONObject} from './socketaddr_item';

interface ListIdentityItemJSONObjet extends Object {
  identity:IdentityJSONObject;
  socketAddress : SocketAddrItemDataJSONObject;
  protocol:number;
}

/**
 * Class describing the list
 */
export class ListIdentityItem extends Item {
  private _encProtocol:number;
  private _socketAddress:SocketAddrItem;
  private _identity:IdentityObject;

  /**
   * ListIdentityItem instance constructor
   * @param {IdentityObject} identity Identity object instance describing the device identity
   * @param {SocketAddrItem} socketAddress SocketAddress Item instance describing the communication socket information
   * @param {number} encProtocol encapsulation protocol version
   */
  constructor(identity:IdentityObject,
      socketAddress:SocketAddrItem,
      encProtocol:number=1) {
    super(ItemType.DATA_LIST_IDENTITY, identity.length + socketAddress.length);
    this._encProtocol = encProtocol;
    this._socketAddress = socketAddress;
    this._identity = identity;
  }

  /**
   * Parse the buffer describing the ListIdentityItem object
   * @param {Buffer} dataBuffer buffer describing the Identity object
   * @return {ListIdentityItem} ListIdentityItem instance
   */
  public parseData(dataBuffer:Buffer):ListIdentityItem {
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

    return new ListIdentityItem(identity, socketAddress, encProtocol);
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

