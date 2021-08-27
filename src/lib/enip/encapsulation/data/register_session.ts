
// QUESTION :register session information are not very usefull but they are exist

interface RegisterSessionJSONObject extends Object {
  protocolVersion: number,
  optionFlags:number,
}

/**
 * Class describe RegisterSession command specific data
 */
export class RegisterSession {
  private _protocol:number = 1;
  private _optionFlags:number = 0;

  /**
   * RegisterSession instance constructor
   */
  public constructor() {}

  /**
   * Get the RegisterSession length in bytes
   * @return {number} Item length
   */
  public get length() : number {
    return 4;
  }

  /**
   * Encode the RegisterSession instance to Buffer
   * @return {Buffer} datagram describing the ListIdentity
   */
  public encode():Buffer {
    const regSessionBuff = Buffer.alloc(4);
    regSessionBuff.writeUInt16LE(this._protocol, 0);
    regSessionBuff.writeUInt16LE(this._optionFlags, 2);

    return regSessionBuff;
  }

  /**
   * Parse a buffer describing the RegisterSession encapsulated data
   * @param {Buffer} regSessionBuffer buffer describing the listitem encapsulated data
   * @return {ListIdentity} a ListIdentity instance
   */
  public static parse(regSessionBuffer:Buffer):RegisterSession {
    const protocol = regSessionBuffer.readUInt16LE(0);
    const optionFlags = regSessionBuffer.readUInt16LE(2);

    checkProtocol(protocol);
    checkOptionFlags(optionFlags);

    return new RegisterSession();
  }

  /**
   * Convert the RegisterSession instance to JSON
   * @return {object} a RegisterSession JSON representation
   */
  public toJSON():RegisterSessionJSONObject {
    return {
      protocolVersion: this._protocol,
      optionFlags: this._optionFlags,
    };
  }
}

/**
 * Check if the Register session protocol version conform
 * @param {number} protocol ListIdentity item count
 */
function checkProtocol(protocol:number) {
  if (protocol != 1) {
    // eslint-disable-next-line max-len
    throw new Error(`ERROR: The RegisterSession protocol version is not conform.
    expected 1 instead of <${protocol}>`);
  }
}
/**
 * Check if the Register session options flags code is conform
 * @param {number} optionFlags  options flags code
 */
function checkOptionFlags(optionFlags:number) {
  if (optionFlags != 0) {
    // eslint-disable-next-line max-len
    throw new Error(`ERROR: The RegisterSession optionFlags code is not conform.
    expected 0 instead of <${optionFlags}>`);
  }
}

// TODO : test for register session
