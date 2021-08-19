import {Segment} from './segment';
import {SegmentType, SegmentTypeObject, SegmentTypeKeys} from './segment_type';
import {LogicalSegment} from './logical/logical_segment';


/**
 * Parse the segment metadata frame to return an typed segment object
 * which inherits segment.
 * @param {Buffer} metaBuffer metadata frame
 * @return {Segment} typed segement
 */
function parseMeta(metaBuffer:Buffer) : Segment {
  const stcode: number = extractType(metaBuffer);
  checkSegmentType(stcode);

  const segment:Segment= SegmentTypeObject[<SegmentTypeKeys>SegmentType[stcode]]
      .initialize(metaBuffer);
  return segment;
}

/**
 * Extract the segment Type code from the metadata frame
 * @param {Buffer} metaBuffer metadata frame
 * @return {number} a numeric code describing the type of segment
 */
function extractType(metaBuffer:Buffer):number {
  // bit shift right to get only the value of 3 first bits.
  return metaBuffer.readUInt8() >>> 5;
}

/**
 * Check if the Logical Segment Format code is conform
 * @param {number} typeCode format code
 */
function checkSegmentType(typeCode:number):void {
  // if no string linked, raise an error
  if (SegmentType[typeCode] == undefined) {
    // eslint-disable-next-line max-len
    throw new Error(`ERROR: The segment type <${typeCode}> is not a available segment type`);
  }
}


export {Segment,
  LogicalSegment,
  parseMeta};
