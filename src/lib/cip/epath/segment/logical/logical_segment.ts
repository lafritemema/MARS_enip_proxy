import {Segment} from '../segment';
import {LogicalType,
  extractLogicalType,
  encodeLogicalType} from './logical_type';
import {LogicalFormat,
  LogicalFormatObject,
  extractLogicalFormat,
  getLogicalProcessor} from './logical_format';
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
    private _logicalProcessor:LogicalFormatObject;

    /**
     * @constructor
     * @param {string} type type of data the value described, default 'RESERVED'
     * @param {string} format size type of the value encapsulated in the segment, default '8_BIT'
     * @param {number} value data encapsulated in the segment
     */
    public constructor(type:number,
        format:number,
        value:number=0) {
      // checkTypeCode(type);
      // checkFormatCode(format);

      super(SegmentType.LOGICAL);
      this._type = type;
      this._format = format;
      this._value = value;
      this._logicalProcessor = getLogicalProcessor(this._format);
    }

    /**
     * Get the segment value size in bytes
     * @return {number} value size in byte
     */
    public get dataLength() : number {
      return this._logicalProcessor ? this._logicalProcessor.size : 0;
    }

    /**
     * Get the segment size in bytes
     * @return {number} value size in byte
     */
    public get length() : number {
      return this._logicalProcessor ? this._logicalProcessor.size + 1 : 0;
    }

    /**
     * Build a LogicalSegment instance from a metadata datagram
     * @param {Buffer} metaBuffer metadata buffer
     * @return {LogicalSegment} LogicalSegment instance
     */
    public static parseMeta(metaBuffer : Buffer): LogicalSegment {
      const fcode = extractLogicalFormat(metaBuffer);
      // ENHANCE : integrate best optimized code check
      const tcode = extractLogicalType(metaBuffer);

      return new LogicalSegment(tcode, fcode);
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

