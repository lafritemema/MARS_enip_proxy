/**
 * @interface LogicalFormatObject
 * interface for objects use in _LogicalFormatPorcessor
 */
export interface LogicalFormatObject{
    size:Readonly<number>,
    read:()=>number,
    write:()=>void
}

/**
 * @enum LogicalFormatEnum
 * enum to enumerate each type of logical segment
 * a LogicalFormatObject is associated for each type
 */
export enum LogicalFormat {
  'BIT_8' = 0,
  'BIT_16' = 1,
  'BIT_32' = 2,
  'RESERVED' = 3
}

/**
 * @enum _LogicalFormatProcessor
 * constant to enumerate size and processing informations
 * according logical segment type 
 */
export const _LogicalFormatPorcessor: Record<string, LogicalFormatObject> = {
  'BIT_8': {size: 1,
    read: Buffer.prototype.readUInt8,
    write: Buffer.prototype.writeUInt8},
  'BIT_16': {size: 2,
    read: Buffer.prototype.readUInt16LE,
    write: Buffer.prototype.writeUInt16LE},
  'BIT_32': {size: 4,
    read: Buffer.prototype.readUInt32LE,
    write: Buffer.prototype.writeUInt32LE},
  'RESERVED': {size: 0,
    read: Buffer.prototype.readUInt32LE,
    write: Buffer.prototype.writeUInt32LE},
};
