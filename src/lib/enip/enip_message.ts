import {BufferIterator} from 'utils';
import EnipData, * as ENIDATA from './encapsulation/data';
import EnipHeader,
{EnipHeaderJSON} from './encapsulation/header';

// ENHANCE : improve interface for ENIP data
interface EnipMessageJSONObject {
  enipHeader:EnipHeaderJSON,
  enipData:object|null
}

/**
 * Clas describing an ENIP packet
 */
export class EnipMessage {
  private _header:EnipHeader;
  private _data:EnipData|undefined;

  /**
   * Enip instance constructor
   * @param {EnipHeader} enipHeader Enip encapsulated header
   * @param {EnipData} enipData Enip encapsulated data
   */
  public constructor(enipHeader:EnipHeader, enipData?:EnipData) {
    this._data = enipData?enipData:undefined;
    this._header = enipHeader;
  }

  /**
   * Parse a buffer describing the Enip message
   * @param {Buffer} enipBuffer buffer describing the Enip packet
   * @return {Enip} a Enip instance
   */
  public static parse(enipBuffer:Buffer):EnipMessage {
    const buffIt = new BufferIterator(enipBuffer);

    const headerBuff = buffIt.next(24).value;
    const header = EnipHeader.parse(headerBuff);

    const dataBuff = buffIt.next(header.dataLengt).value;

    let data:EnipData;

    // ENHANCE : improve EnipData object selection
    switch (header.command) {
      case 0x63:
        data = ENIDATA.ListIdentity.parse(dataBuff);
        break;
      case 0x65:
        data = ENIDATA.RegisterSession.parse(dataBuff);
        break;
      case 0x6f:
        data = ENIDATA.SendRR.parse(dataBuff);
        break;
      default:
        // eslint-disable-next-line max-len
        throw new Error(`The enip command <${header.command} is not valid or not implemented.`);
    }

    return new EnipMessage(header, data);
  }

  /**
   * Encode the Enip instance to Buffer
   * @return {Buffer} datagram describing the Enip instance
   */
  public encode():Buffer {
    const headerBuff = this._header.encode();
    if (this._data !=undefined) {
      const dataBuff = this._data.encode();
      return Buffer.concat([headerBuff, dataBuff]);
    } else {
      return headerBuff;
    }
  }

  /**
   * Convert the Enip instance to JSON
   * @return {object} a Enip JSON representation
   */
  public toJSON():EnipMessageJSONObject {
    return {
      enipData: this._data?this._data.toJSON():null,
      enipHeader: this._header.toJSON(),
    };
  }
}
