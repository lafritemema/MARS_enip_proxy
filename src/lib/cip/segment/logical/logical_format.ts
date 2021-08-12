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
  '8_BIT' = 0,
  '16_BIT' = 1,
  '32_BIT' = 2,
  'RESERVED' = 3
}

/**
 * @enum _LogicalFormatProcessor
 * constant to enumerate size and processing informations
 * according logical segment type 
 */
export const _LogicalFormatPorcessor: Record<string, LogicalFormatObject> = {
  '8_BIT': {size: 1,
    read: Buffer.prototype.readUInt8,
    write: Buffer.prototype.writeUInt8},
  '16_BIT': {size: 2,
    read: Buffer.prototype.readUInt16LE,
    write: Buffer.prototype.writeUInt16LE},
  '32_BIT': {size: 4,
    read: Buffer.prototype.readUInt32LE,
    write: Buffer.prototype.writeUInt32LE},
  'RESERVED': {size: 0,
    read: Buffer.prototype.readUInt32LE,
    write: Buffer.prototype.writeUInt32LE},
};
