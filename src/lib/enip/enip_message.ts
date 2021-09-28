import {BufferIterator} from 'utils';
import EnipData, {ListIdentity,
  ListIdentityBody,
  RegisterSession,
  SendRR,
  SendRRBody} from './encapsulation/data';
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
   * Get communication session
   */
  public get session() {
    return this._header.session;
  }

  /**
   * Get the status of request
   */
  public get status() {
    return this._header.getStatus();
  }


  /**
   * Get the command of request
   */
  public get command() {
    return this._header.getCommand();
  }

  /**
   * Get the data message body
   * @return {ListIdentityBody|SendRRBody|undefined} message body
   */
  public get body():ListIdentityBody|SendRRBody|undefined {
    if (this._data instanceof ListIdentity) {
      return (<ListIdentity> this._data).body;
    } else if (this._data instanceof SendRR) {
      return (<SendRR> this._data).body;
    }
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

    // if request status = success in header
    if (header.getStatus().state) {
      let data:EnipData;

      const dataBuff = buffIt.next(header.dataLengt).value;
      // ENHANCE : improve EnipData object selection
      switch (header.command) {
        case 0x63:
          data = ListIdentity.parse(dataBuff);
          break;
        case 0x65:
          data = RegisterSession.parse(dataBuff);
          break;
        case 0x6f:
          data = SendRR.parse(dataBuff);
          break;
        default:
        // eslint-disable-next-line max-len
          throw new Error(`The enip command <${header.command} is not valid or not implemented.`);
      }
      return new EnipMessage(header, data);
    } else {
      return new EnipMessage(header);
    }
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

