// import {ItemType} from './item_type';
/**
 * Class describing an encapsulation item
 */
export abstract class Item {
  protected _type : number;
  protected _dataLength :number;

  /**
   * Item instance constructor
   * @param {number} type CPF item type code
   * @param {number} dataLength Item length in bytes
   * @protected
   */
  protected constructor(type:number, dataLength:number=0) {
    // ENHANCE : integrate best optimized item type check
    // checkItemType(type);
    this._type = type;
    this._dataLength = dataLength;
  }

  /**
   * Get the Item length in bytes
   * @return {number} Item length
   */
  public get length() : number {
    // data length + metadata length (typeid + length = 4 bytes)
    return this._dataLength + 4;
  }

  /**
   * Get the Item data length in bytes
   * @return {number} Item data length
   */
  public get dataLength() : number {
    return this._dataLength;
  }
  /**
   * Set the item data length in byte
   * @param {number} length data length
   */
  public set dataLength(length:number) {
    this._dataLength = length;
  }

  /**
   * Get the item type code
   * @return {number} item type code
   */
  public get type(): number {
    return this._type;
  }

  /**
   * Set the item type code
   * @param {number} typeCode the type code
   */
  public set type(typeCode:number) {
    // ENHANCE : integrate best optimized item type check
    // checkItemType(typeCode);
    this._type = typeCode;
  }

  public abstract toJSON():object;
  public abstract encode():Buffer;
  public abstract parseData(buffer:Buffer):void;
  public abstract get group():string;
}
