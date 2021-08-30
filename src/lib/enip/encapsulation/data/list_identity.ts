
import {ListIdentityItem,
  ListIdentityItemJSONObjet} from './item/list_identity_item';

interface ListIdentityJSONObjet extends Object {
  itemCount:number,
  identityItem:ListIdentityItemJSONObjet,
}
/**
 * Class describe ListIdentity command specific data
 */
export class ListIdentity {
  // QUESTION : itemcount always = 1 ??
  private _itemCount:number = 1;
  private _identityItem:ListIdentityItem;

  /**
   * ListIdentity instance constructor
   * @param {ListIdentityItem} identityItem Identity item object
   */
  public constructor(identityItem:ListIdentityItem) {
    this._identityItem = identityItem;
  }

  /**
   * Get the ListIdentity length in bytes
   * @return {number} Item length
   */
  public get length() : number {
    return this._identityItem.length + 2;
  }

  /**
   * Encode the ListIdentity instance to Buffer
   * @return {Buffer} datagram describing the ListIdentity
   */
  public encode():Buffer {
    const metaBuff = Buffer.alloc(2);
    metaBuff.writeUInt16LE(this._itemCount, 0);
    const identityItemBuffer = this._identityItem.encode();
    return Buffer.concat([
      metaBuff,
      identityItemBuffer,
    ]);
  }

  /**
   * Parse a buffer describing the listitem encapsulated data
   * @param {Buffer} listIdentityBuff buffer describing the listitem encapsulated data
   * @return {ListIdentity} a ListIdentity instance
   */
  public static parse(listIdentityBuff:Buffer):ListIdentity {
    const itemCount = listIdentityBuff.readUInt16LE(0);

    checkItemCount(itemCount);

    const identityBuffer = listIdentityBuff.slice(2);
    const identityItem = ListIdentityItem.parse(identityBuffer);

    return new ListIdentity(identityItem);
  }

  /**
   * Convert the ListIdentityinstance to JSON
   * @return {object} a ListIdentity JSON representation
   */
  public toJSON():ListIdentityJSONObjet {
    return {
      itemCount: 1,
      identityItem: this._identityItem.toJSON(),
    };
  }
}

// QUESTION : If not always 1, must update the function !!
/**
 * Check if the listIdentity item count is conform
 * @param {number} itemCount ListIdentity item count
 */
function checkItemCount(itemCount:number) {
  if (itemCount != 1) {
    // eslint-disable-next-line max-len
    throw new Error(`ERROR: The ListIdentity item count is not conform.
    expected 1 instead of <${itemCount}>`);
  }
}

// TODO : test for listidentity
