import {BufferIterator} from '../../../utils/buffer_iterator';
import {EnipCommand} from './enip_command';
import {EnipStatus} from './enip_status';

export interface EnipHeaderJSONObject extends Object{
  command:string,
  dataLength:number,
  session:string,
  status:string,
  senderContext:number[],
  options:number,
}

/**
 * Class describing an ENIP header
 */
export class EnipHeader {
  private _command:number;
  private _dataLength:number;
  private _session:number;
  private _status:number;
  private _senderContext:Buffer;
  private _options:number;

  /**
   * EnipHeader constructor
   * @param {number} command enip command code
   * @param {number} dataLength length in bytes of data portion
   * @param {number} session session id
   * @param {number} status enip status code
   * @param {Buffer} scontext Information pertinent only to the sender of an
encapsulation command. length of 8 bytes
   * @param {number} options options flags
   */
  public constructor(command:number,
      dataLength:number,
      session:number,
      status:number,
      scontext:Buffer,
      options:number) {
    this._command= command;
    this._dataLength= dataLength;
    this._session = session;
    this._status= status;
    this._senderContext= scontext;
    this._options=options;
  }

  /**
   * Get the only the EnipHeader length in bytes
   * @return {number} EnipHeader length
   */
  public get length():number {
    return 24;
  }

  /**
   * Get the encapsulated data length in bytes
   * @return {number} encapsulated data length
   */
  public get dataLengt():number {
    return this._dataLength;
  }

  /**
   * Get EnipHeader command code in bytes
   * @return {number} EnipHeader length
   */
  public get command():number {
    return this._command;
  }

  /**
   * Parse the buffer describing the enip header
   * @param {Buffer} headerBuffer buffer describing the enip header
   * @return {EnipHeader} EnipHeader instance
   */
  public static parse(headerBuffer:Buffer):EnipHeader {
    const buffIt = new BufferIterator(headerBuffer);

    // get command info => 2 first byte
    const command = buffIt.next(2).value.readUInt16LE();

    // get length info => 2 next bytes
    const dataLength = buffIt.next(2).value.readUInt16LE();

    // get session info => next 4 bytes
    const session = buffIt.next(4).value.readUInt32LE();

    // get status info => next 4 bytes
    const status = buffIt.next(4).value.readUInt32LE();

    // get sender context => next 8 bytes
    const senderContext = buffIt.next(8).value;

    // get options => next 4 bytes
    const options = buffIt.next(4).value.readUInt32LE();

    return new EnipHeader(command,
        dataLength,
        session,
        status,
        senderContext,
        options);
  }

  /**
   * Build a buffer describing the EnipHeader instance
   * @return {Buffer} buffer describing the IdentityObject instance
   */
  public encode():Buffer {
    // init a 24 bytes size buffer
    const headerBuffer = Buffer.alloc(24);

    // write command size 2 bytes
    headerBuffer.writeUInt16LE(this._command, 0);

    // write data lenght size 2 bytes
    headerBuffer.writeUInt16LE(this._dataLength, 2);

    // write session size 4 bytes
    headerBuffer.writeUInt32LE(this._session, 4);

    // write status size 4 bytes
    headerBuffer.writeUInt32LE(this._status, 8);

    // copy sender context size 8 bytes
    this._senderContext.copy(headerBuffer, 12);

    // write options size 4 bytes
    headerBuffer.writeInt32LE(this._options, 20);

    return headerBuffer;
  }

  /**
   * Convert the EnipHeader instance to JSON
   * @return {object} the JSON representation
   */
  public toJSON():EnipHeaderJSONObject {
    return {
      command: EnipCommand[this._command],
      dataLength: this._dataLength,
      session: this._session != 0 ? this._session.toString(16) : '00000000',
      status: EnipStatus[this._status],
      senderContext: Array.from(this._senderContext),
      options: this._options,
    };
  }
}
