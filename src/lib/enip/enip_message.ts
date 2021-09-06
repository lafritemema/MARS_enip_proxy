import {BufferIterator} from '../utils/buffer_iterator';
import {EnipData} from './encapsulation/data/enip_data';
import {ListIdentity} from './encapsulation/data/list_identity';
import {RegisterSession} from './encapsulation/data/register_session';
import {SendRRData} from './encapsulation/data/send_RR_data';
import {EnipHeader,
  EnipHeaderJSONObject} from './encapsulation/header/enip_header';

// ENHANCE : improve interface for ENIP data
interface EnipJSONObject {
  enipHeader:EnipHeaderJSONObject,
  enipData:object
}


/**
 * Clas describing an ENIP packet
 */
export class Enip {
  private _header:EnipHeader;
  private _data:EnipData;

  /**
   * Enip instance constructor
   * @param {EnipHeader} enipHeader Enip encapsulated header
   * @param {EnipData} enipData Enip encapsulated data
   */
  public constructor(enipHeader:EnipHeader, enipData:EnipData) {
    this._data = enipData;
    this._header = enipHeader;
  }

  /**
   * Parse a buffer describing the Enip packet
   * @param {Buffer} enipBuffer buffer describing the Enip packet
   * @return {Enip} a Enip instance
   */
  public static parse(enipBuffer:Buffer):Enip {
    const buffIt = new BufferIterator(enipBuffer);

    const headerBuff = buffIt.next(24).value;
    const header = EnipHeader.parse(headerBuff);

    const dataBuff = buffIt.next(header.dataLengt).value;

    let data:EnipData;

    // ENHANCE : improve EnipData object selection
    switch (header.command) {
      case 0x63:
        data = ListIdentity.parse(dataBuff);
        break;
      case 0x65:
        data = RegisterSession.parse(dataBuff);
        break;
      case 0x6f:
        data = SendRRData.parse(dataBuff);
        break;
      default:
        // eslint-disable-next-line max-len
        throw new Error(`The enip command <${header.command} is not valid or not implemented.`);
    }

    return new Enip(header, data);
  }

  /**
   * Encode the Enip instance to Buffer
   * @return {Buffer} datagram describing the Enip instance
   */
  public encode():Buffer {
    const headerBuff = this._header.encode();
    const dataBuff = this._data.encode();
    return Buffer.concat([headerBuff, dataBuff]);
  }

  /**
   * Convert the Enip instance to JSON
   * @return {object} a Enip JSON representation
   */
  public toJSON():EnipJSONObject {
    return {
      enipData: this._data.toJSON(),
      enipHeader: this._header.toJSON(),
    };
  }

  /**
   * Build an instance describing a register session request
   * @return {Enip} Enip instance
   */
  public static buildRegisterSessionReq() {
    const header = EnipHeader.buildRegSessionHeader();
    const data = new RegisterSession();
    return new Enip(header, data);
  }
}