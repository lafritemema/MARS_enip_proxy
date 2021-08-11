
import {Segment} from '../segment';
import {LogicalTypeKey, LogicalType} from './logical_type';
import {LogicalFormat, LogicalFormatKey} from './logical_format';

// import {BitVector} from '../utils/bitvector';

type LogicalFormatKeyNA = LogicalFormatKey|'NA';
type LogicalTypeKeyNA = LogicalTypeKey|'NA';

/**
 * Class represents a logical type segment
 * The logical segment is a type of segment define by the CIP protocol
 * @class LogicalSegment
 * @implement Segment
 */
export class LogicalSegment extends Segment {
    private _type : LogicalTypeKeyNA;
    private _format: LogicalFormatKeyNA;
    private _value : number;

    /**
     * @constructor
     * @param {string} type type of data the value described, default 'RESERVED'
     * @param {string} format size type of the value encapsulated in the segment, default '8_BIT'
     * @param {number} value data encapsulated in the segment
     */
    constructor(type:LogicalTypeKeyNA='NA',
        format:LogicalFormatKeyNA='NA',
        value:number=0) {
      super('LOGICAL');
      this._type = type;
      this._format = format;
      this._value = value;
    }

    /**
     * Get the segment value size in bytes
     * @return {number} value size in byte
     */
    get dataSize() : number {
      return this._format!='NA' ? LogicalFormat.getSize(this._format) : 0;
    }

    /**
     * Parse metadata frame
     * @param {Buffer} metaBuffer metadata buffer
     */
    public parseMeta(metaBuffer : Buffer): void {
      this._format = extractLogicalFormat(metaBuffer);
      this._type = extractLogicalType(metaBuffer);
    }

    /**
     * Parse data frame
     * @param {Buffer} dataBuffer
     */
    public parseData(dataBuffer:Buffer):void {
      if (this._format!='NA') {
        this._value = LogicalFormat.getValue(dataBuffer, this._format);
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
      const logicalCode = 32;
      const type = buildLogicalType(<LogicalTypeKey> this._type);
      const format = buildLogicalFormat(<LogicalFormatKey> this._format);
      const segmentCode = logicalCode | type | format;

      const metaBuffer = Buffer.alloc(1);
      metaBuffer.writeUInt8(segmentCode);

      const dataBufer = LogicalFormat.buildBuffer(this._value, this._format);

      return Buffer.concat([metaBuffer, dataBufer]);
    }
}

/**
 * Extract the logical segment type code from the metadata frame
 * @param {Buffer} metaBuffer metadata frame
 * @return {number} a numeric code describing the logical segment type
 */
function extractLogicalType(metaBuffer:Buffer) : LogicalTypeKey {
  // apply a binary filter (000111000)
  // and a right shift of 2
  // to get the logical type (bit 4 to 6 of buffer)
  const ltcode = (metaBuffer.readUInt8() & 28) >>> 2;
  const type = LogicalType[ltcode];

  if (type == undefined) {
    // eslint-disable-next-line max-len
    throw new Error(`ERROR: The logical segment type <${ltcode}> is not a available logical segment type`);
  }

  return <LogicalTypeKey>LogicalType[ltcode];
}

/**
 * Extract the logical segment format code from the metadata frame
 * @param {Buffer} metaBuffer metadata frame
 * @return {number} a numeric code describing the logical segment format
*/
function extractLogicalFormat(metaBuffer:Buffer) : LogicalFormatKey {
  // apply a binary filter (00000011)
  // to get the logical format (bit 7 and 8 of buffer)
  const lfcode = metaBuffer.readUInt8() & 3;
  const format = LogicalFormat.getType(lfcode);

  if (format == undefined) {
    // eslint-disable-next-line max-len
    throw new Error(`ERROR: The logical segment format <${lfcode}> is not a available logical segment format`);
  }

  return <LogicalFormatKey>LogicalFormat.getType(lfcode);
}

/**
 * Build the logical type code for metadata frame generation
 * @param {LogicalTypeKey} type logical segment type
 * @return {number} code for metadata frame generation
 */
function buildLogicalType(type:LogicalTypeKey):number {
  const ltcode = LogicalType[type];
  return ltcode << 2;
}

/**
 * Build the logical type code for metadata frame generation
 * @param {LogicalFormateKey} format logical segment type
 * @return {number} code for metadata frame generation
 */
function buildLogicalFormat(format:LogicalFormatKey):number {
  const lfcode = LogicalFormat.getCode(format);

  if (lfcode==undefined) {
    throw new Error(`Error: the logical format <${format}> is not available.`);
  }
  return lfcode;
}
