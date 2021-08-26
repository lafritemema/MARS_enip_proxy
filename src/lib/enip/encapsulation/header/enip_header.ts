import {EnipCommand} from './enip_command';
import {EnipStatus} from './enip_status';

/**
 * Class describing an ENIP header
 */
export class EnipHeader {
  private _command:number;
  private _length:number;
  private _session:number;
  private _status:number;
  private _senderContext:Buffer;
  private _options:number;

  /**
   * EnipHeader constructor
   * @param {number} command enip command code
   * @param {number} length length in bytes of data portion
   * @param {number} session session id
   * @param {number} status enip status code
   * @param {Buffer} scontext Information pertinent only to the sender of an
encapsulation command. length of 8 bytes
   * @param {number} options options flags
   */
  public constructor(command:number,
      length:number,
      session:number,
      status:number,
      scontext:Buffer,
      options:number) {
    this._command= command;
    this._length= length;
    this._session = session;
    this._status= status;
    this._senderContext= scontext;
    this._options=options;
  }
  /**
   * Build an NOP command header
   * @return {EnipHeader} specific header for NOP command
   */
  public static buildNOPHeader() : EnipHeader {
    return new EnipHeader(
        EnipCommand.NOP, // NOP command
        0, // data length : 0
        0, // session id : 0,
        EnipStatus.SUCCESS, // status : 0
        Buffer.alloc(8), // context : empty buffer size 8
        0);// options flags : 0
  }

  /**
   * Build an ListIdentity command header
   * @return {EnipHeader} specific header for NOP command
   */
  public static buildListIdentityHeader() : EnipHeader {
    return new EnipHeader(
        EnipCommand.ListIdentity, // ListIdentity command
        0, // data length : 0
        0, // session id : 0,
        EnipStatus.SUCCESS, // status : 0
        Buffer.alloc(8), // context : empty buffer size 8
        0);// options flags : 0
  }

  /**
   * Build an RegisterSession command header
   * @return {EnipHeader} specific header for NOP command
   */
  public static buildRegSessionHeader(/* TODO: ADD CPF PACKET*/) : EnipHeader {
    return new EnipHeader(
        EnipCommand.RegisterSession, // ListIdentity command
        4, // data length : 0
        0, // session id : 0,
        EnipStatus.SUCCESS, // status : 0
        Buffer.alloc(8), // context : empty buffer size 8
        0);// options flags : 0
  }

  /**
   * Build an UnregisterSession command header
   * @param {number} session session id
   * @return {EnipHeader} specific header for NOP command
   */
  public static buildUnRegSessionHeader(session:number) : EnipHeader {
    return new EnipHeader(
        EnipCommand.UnregisterSession, // ListIdentity command
        0, // data length : 0
        session, // session id : 0,
        EnipStatus.SUCCESS, // status : 0
        Buffer.alloc(8), // context : empty buffer size 8
        0);// options flags : 0
  }

  /**
   * Build an UnregisterSession command header
   * @param {number} session session id
   * @return {EnipHeader} specific header for NOP command
   */
  public static buildSendRRDataHeader(session:number) : EnipHeader {
    return new EnipHeader(
        EnipCommand.SendRRData, // ListIdentity command
        0, // data length : 0
        session, // session id : 0,
        EnipStatus.SUCCESS, // status : 0
        Buffer.alloc(8), // context : empty buffer size 8
        0);// options flags : 0
  }

  // TODO : parse and encode enip header
}
