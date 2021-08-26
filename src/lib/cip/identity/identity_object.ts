import {BufferIterator} from '../../utils/buffer_iterator';
import {DeviceProfile} from './device_profile';
import {DeviceState} from './device_state';
const VendorName:Record<number, string> = require('./vendor_name.json');

export interface IdentityJSONObject extends Object {
  vendorId:number,
  vendorName:string,
  deviceType:string,
  productCode:number,
  revision:string,
  status:number,
  serialNumber:string,
  productName:string,
  state:string
}

/**
 * Class describing a CIP Identity object
 */
export class IdentityObject {
  private _vendorId:number;
  private _deviceType:number;
  private _productCode:number;
  private _majorRevision:number;
  private _minorRevision:number;
  private _status:number;
  private _serialNumber:number;
  private _productName:string;
  private _state:number;

  /**
   * Identity object constructor
   * @param {number} vendorId vendor identification code
   * @param {number} deviceType product general type code
   * @param {number} productCode product specific type code
   * @param {number} majorRevision major version of product
   * @param {number} minorRevision minor version of product
   * @param {number} status status of device
   * @param {number} serialNumber serial number of device
   * @param {string} productName product name
   * @param {number} state present state of device
   */
  public constructor(
      vendorId:number,
      deviceType:number,
      productCode:number,
      majorRevision:number,
      minorRevision:number,
      status:number,
      serialNumber:number,
      productName:string,
      state:number) {
    this._vendorId = vendorId;
    this._deviceType = deviceType;
    this._productCode = productCode;
    this._majorRevision = majorRevision;
    this._minorRevision = minorRevision;
    this._status = status;
    this._serialNumber = serialNumber;
    this._productName = productName;
    this._state = state;
  }

  /**
   * Get the IndentityObject length in bytes
   * @return {number} IndentityObject length
   */
  public get length():number {
    return this._productName.length + 16;
  }

  /**
   * Parse the buffer describing the Identity object
   * @param {Buffer} idObjectBuffer buffer describing the Identity object
   * @return {IdentityObject} IdentityObject instance
   */
  public static parse(idObjectBuffer:Buffer):IdentityObject {
    const buffIt = new BufferIterator(idObjectBuffer);

    // get the vendorid => 2 first bytes
    const vendorId = buffIt.next(2).value.readUInt16LE();
    // get the device type => 2 next bytes
    const deviceType = buffIt.next(2).value.readUInt16LE();
    // get the product code => 2 next bytes
    const productCode = buffIt.next(2).value.readUInt16LE();

    // get the buffer describing the revision and extract major and minor rev
    const revisionBuff = buffIt.next(2).value;
    const majorRev = revisionBuff.readUInt8(0);
    const minorRev = revisionBuff.readUInt8(1);

    // get the product status
    const status = buffIt.next(2).value.readUInt16LE();
    // get the serial number
    const serialNbr = buffIt.next(4).value.readUInt32LE();

    // get the product name
    const productNameLenght = buffIt.next().value.readUInt8();
    const productName = buffIt.next(productNameLenght).value.toString();

    // get the product state
    const state = buffIt.next().value.readUInt8();

    return new IdentityObject(vendorId,
        deviceType,
        productCode,
        majorRev,
        minorRev,
        status,
        serialNbr,
        productName,
        state);
  };

  /**
   * Build a buffer describing the IdentityObject instance
   * @return {Buffer} buffer describing the IdentityObject instance
   */
  public encode():Buffer {
    // create a buffer to store informations
    const idBuffer = Buffer.alloc(16 + this._productName.length);

    idBuffer.writeUInt16LE(this._vendorId, 0);
    idBuffer.writeUInt16LE(this._deviceType, 2);
    idBuffer.writeUInt16LE(this._productCode, 4);
    idBuffer.writeInt8(this._majorRevision, 6);
    idBuffer.writeInt8(this._minorRevision, 7);
    idBuffer.writeUInt16LE(this._status, 8);
    idBuffer.writeUInt32LE(this._serialNumber, 10);
    idBuffer.writeUInt8(this._productName.length, 14);
    idBuffer.write(this._productName, 15);
    idBuffer.writeUInt8(this._state, 15 + this._productName.length);

    return idBuffer;
  }

  /**
   * Convert the IndentityObject instance to JSON
   * @return {object} the JSON representation
   */
  public toJSON():IdentityJSONObject {
    return {
      vendorId: this._vendorId,
      vendorName: VendorName[this._vendorId],
      deviceType: DeviceProfile[this._deviceType]
          .replace(/((?!^)[A-Z])/g, ' $1'), // transform camelcase to regular string
      productCode: this._productCode,
      revision: `${this._majorRevision}.${this._minorRevision}`,
      status: this._status,
      serialNumber: this._serialNumber.toString(16),
      productName: this._productName,
      state: DeviceState[this._state]
          .replace(/((?!^)[A-Z])/g, ' $1'), // transform camelcase to regular string
    };
  }
}
