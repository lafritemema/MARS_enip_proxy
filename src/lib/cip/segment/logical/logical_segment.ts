import {Segment} from '../segment';
import {LogicalType} from './logical_type';
import {LogicalFormat,
  _LogicalFormatPorcessor,
  LogicalFormatObject} from './logical_format';
import {SegmentType} from '../segment_type';

// import {BitVector} from '../utils/bitvector';

/**
 * Class represents a logical type segment
 * The logical segment is a type of segment define by the CIP protocol
 * @class LogicalSegment
 * @implement Segment
 */
export class LogicalSegment extends Segment {
    private _type : number;
    private _format: number;
    private _value : number;
    private _logicalProcessor:LogicalFormatObject|undefined;

    /**
     * @constructor
     * @param {string} type type of data the value described, default 'RESERVED'
     * @param {string} format size type of the value encapsulated in the segment, default '8_BIT'
     * @param {number} value data encapsulated in the segment
     */
    constructor(type:number=-1,
        format:number=-1,
        value:number=0) {
      checkTypeCode(type);
      checkFormatCode(format);

      super(SegmentType.LOGICAL);
      this._type = type;
      this._format = format;
      this._value = value;
      this._logicalProcessor = this._format!=-1 ?
        _LogicalFormatPorcessor[LogicalFormat[this._format]] :
        undefined;
    }

    /**
     * Get the segment value size in bytes
     * @return {number} value size in byte
     */
    get dataSize() : number {
      return this._logicalProcessor ? this._logicalProcessor.size : 0;
    }

    /**
     * Parse metadata frame
     * @param {Buffer} metaBuffer metadata buffer
     */
    public parseMeta(metaBuffer : Buffer): void {
      this._format = decodeLogicalFormat(metaBuffer);
      this._type = decodeLogicalType(metaBuffer);
    }

    /**
     * Parse data frame
     * @param {Buffer} dataBuffer
     */
    public parseData(dataBuffer:Buffer):void {
      if (this._logicalProcessor != undefined) {
        this._value = this._logicalProcessor.read.call(dataBuffer);
      } else {
        throw new Error(`ERROR: The logical segment format is not a defined.
        No enough informations to parse the data frame.`);
      }
    }

    /**
     * Initialize the segment
     * @param {Buffer} metaBuffer
     * @return {LogicalSegment} the logical segment
     */
    public static initialize(metaBuffer:Buffer): LogicalSegment {
      const lsegment = new LogicalSegment();
      lsegment.parseMeta(metaBuffer);

      return lsegment;
    }

    /**
     * Build the buffer describing the segment metadata
     * @return {Buffer} the buffer describing the Segment
     */
    public encode() : Buffer {
      if (this._type != -1 &&
         this._format != -1 &&
         this._value != 0 &&
         this._logicalProcessor != undefined) {
        const logicalCode = 0x20;
        const type = encodeLogicalType(this._type);
        const segmentCode = logicalCode | type | this._format;

        const metaBuffer = Buffer.alloc(1);
        metaBuffer.writeUInt8(segmentCode);

        const dataBuffer = Buffer.alloc(this._logicalProcessor.size);
        // @ts-ignore
        this._logicalProcessor.write.call(dataBuffer, this._value);

        return Buffer.concat([metaBuffer, dataBuffer]);
      } else {
        throw new Error('The segment is not conform to be encoded');
      }
    }

    /**
   * Convert the logical segment instance to JSON
   * @return {object} the JSON representation
   */
    public toJSON():object {
      if (
        this._type != -1 &&
        this._format != -1) {
        return {
          segment: 'LOGICAL',
          type: LogicalType[this._type],
          format: LogicalFormat[this._format],
          value: this._value};
      } else {
        return {
          segment: 'NOT CONFORM LOGICAL',
          type: this._type,
          format: this._format,
          value: this._value};
      }
    }
}

/**
 * Extract the logical segment type code from the metadata frame
 * @param {Buffer} metaBuffer metadata frame
 * @return {number} a numeric code describing the logical segment type
 */
function decodeLogicalType(metaBuffer:Buffer) : number {
  // apply a binary filter (00011100)
  // and a right shift of 2
  // to get the logical type (bit 4 to 6 of buffer)
  const ltcode = (metaBuffer.readUInt8() & 0x1c) >>> 2;
  checkTypeCode(ltcode);

  return ltcode;
}

/**
 * Extract the logical segment format code from the metadata frame
 * @param {Buffer} metaBuffer metadata frame
 * @return {number} a numeric code describing the logical segment format
*/
function decodeLogicalFormat(metaBuffer:Buffer) : number {
  // apply a binary filter (00000011)
  // to get the logical format (bit 7 and 8 of buffer)
  const lfcode = metaBuffer.readUInt8() & 3;
  checkFormatCode(lfcode);

  return lfcode;
}

/**
 * Build the logical type code for metadata frame generation
 * @param {number} typeCode logical segment type
 * @return {number} code for metadata frame generation
 */
function encodeLogicalType(typeCode:number):number {
  return typeCode << 2;
}

/**
 * Check if the Logical Segment Format code is conform
 * @param {number} formatCode format code
 */
function checkFormatCode(formatCode : number) :void {
  if (LogicalFormat[formatCode] == undefined) {
    // eslint-disable-next-line max-len
    throw new Error(`ERROR: The logical segment format <${formatCode}> is not a available logical segment format`);
  }
}

/**
 * Check if the Logical Segment Type code is conform
 * @param {number} typeCode type code
 */
function checkTypeCode(typeCode : number) :void {
  if (LogicalType[typeCode] == undefined) {
    // eslint-disable-next-line max-len
    throw new Error(`ERROR: The logical segment format <${typeCode}> is not a available logical segment format`);
  }
}
