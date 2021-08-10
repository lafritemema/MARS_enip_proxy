/**
 * @interface LogicalFormatObject
 * interface for objects use in LogicalFormatEnum
 */
interface LogicalFormatObject{
    code:Readonly<number>,
    size:Readonly<number>,
    uRead:()=>number,
    read:()=>number,
    uWrite:()=>void,
    write:()=>void
}

/**
 * @enum LogicalFormatEnum
 * constant to enumerate each type of logical segment size
 * a LogicalFormatObject is associated for each type
 */
const LogicalFormatEnum: Record<string, LogicalFormatObject> = {
  '8_BIT': {code: 0, size: 1,
    uRead: Buffer.prototype.readUInt8,
    read: Buffer.prototype.readInt8,
    uWrite: Buffer.prototype.writeUInt8,
    write: Buffer.prototype.writeInt8},
  '16_BIT': {code: 1, size: 2,
    uRead: Buffer.prototype.readUInt16LE,
    read: Buffer.prototype.readInt16LE,
    uWrite: Buffer.prototype.writeUInt16LE,
    write: Buffer.prototype.writeInt16LE},
  '32_BIT': {code: 2, size: 4,
    uRead: Buffer.prototype.readUInt32LE,
    read: Buffer.prototype.readInt32LE,
    uWrite: Buffer.prototype.writeUInt32LE,
    write: Buffer.prototype.writeInt32LE},
  'RESERVED': {code: 4, size: 0,
    uRead: Buffer.prototype.readUInt32LE,
    read: Buffer.prototype.readInt32LE,
    uWrite: Buffer.prototype.writeUInt32,
    write: Buffer.prototype.writeInt32LE},
};

/**
 * @type LogicalFormatKey
 */
export type LogicalFormatKey = keyof typeof LogicalFormatEnum |'NA';

/**
 * Class to interact with LogicalFormatEnum
 * @abstract @class LogicalFormat
 */
export abstract class LogicalFormat {
  /**
     * Get the segment data size according
     * to a CIP format code or CIP format name
     * @param {number|string} key format code or name
     * @return {number} the size
     */
  public static getSize(key:number|string) : number {
    if (typeof key == 'string') {
      if (Object.keys(LogicalFormatEnum).includes(key)) {
        return LogicalFormatEnum[<LogicalFormatKey>key].size;
      }
    } else {
      for (const k of Object.keys(LogicalFormatEnum)) {
        const lf = LogicalFormatEnum[<LogicalFormatKey>k];
        if (lf.code == key) return lf.size;
      }
    }
    return 0;
  }
  /**
     * Get the CIP format code according to the CIP format name
     * @param {string} key CIP format name
     * @return {number|undefined} CIP format code if exist else undefined
     */
  public static getCode(key:string) : number|undefined {
    return Object.keys(LogicalFormatEnum).includes(key) ?
            LogicalFormatEnum[<LogicalFormatKey>key].code :
            undefined;
  }

  /**
     * Get the CIP format name according to the CIP format code
     * @param {number} key CIP format code
     * @return {string} CIP format name
     */
  public static getType(key:number):string|undefined {
    for (const k of Object.keys(LogicalFormatEnum)) {
      const lf = LogicalFormatEnum[<LogicalFormatKey>k];
      if (lf.code == key) return k;
    }
    return undefined;
  }

  /**
     * Parse a buffer to get the containing value
     * according the logical segment format
     * @param {Buffer} dataBuffer - buffer containing the data
     * @param {LogicalFormatKey} format - logical segment format
     * @param {boolean} unsigned - signed or unsigned data - default true
     * @return {number} data value
     */
  public static getValue(dataBuffer:Buffer,
      format: LogicalFormatKey,
      unsigned:boolean=true) : number {
    if (unsigned) {
      return LogicalFormatEnum[format].uRead.call(dataBuffer);
    } else {
      return LogicalFormatEnum[format].read.call(dataBuffer);
    }
  }

  /**
   * Build a buffer containing a value according the format
   * @param {number} value value to write in the buffer
   * @param {LogicalFormatKey} format value format
   * @param {boolean} unsigned true if the value is unsigned else false
   * @return {Buffer} a buffer containing the value
   */
  public static buildBuffer(value:number,
      format: LogicalFormatKey,
      unsigned:boolean=true) : Buffer {
    const lf = LogicalFormatEnum[format];

    const buf = Buffer.alloc(lf.size);

    if (unsigned) {
      // @ts-ignore
      lf.uWrite.call(buf, value);
    } else {
      // @ts-ignore
      lf.write.call(buf, value);
    }
    return buf;
  }
}
