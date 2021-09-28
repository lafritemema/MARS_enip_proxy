/* eslint-disable no-unused-vars */

import {Segment} from './segment';
import {LogicalSegment} from './logical/logical_segment';

// type SegmentTypeKeys = keyof typeof SegmentTypeObject;

export enum SegmentType {
  // PORT=0,
  LOGICAL=1
    /* NETWORK=2,
    SYMBOLIC=3,
    DATA=4,
    DATA_TYPE_CONST=5,
    DATA_TYPE_ELEM=6,
    RESERVED=7 */
}

/**
 * parse the metabuffer to extract the segment type
 * @param {Buffer} metaBuffer buffer containing the segment type
 * @return {number} the segment type code
 */
export function extractSegmentType(metaBuffer:Buffer):number {
  const typeCode = extractType(metaBuffer);
  checkSegmentType(typeCode);

  return typeCode;
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


/**
 * build a typed segment from the metadata buffer
 * @param {Buffer} metaBuffer metadata buffer
 * @return {Segment} a typed segment heritate from Segment

export function buildTypedSegment(metaBuffer:Buffer):Segment {
  // eslint-disable-next-line new-cap
  const typeCode = extractType(metaBuffer);
  checkSegmentType(typeCode);

  let segment:Segment;

  switch (SegmentType[typeCode]) {
    case 'LOGICAL':
      segment = LogicalSegment.parseMeta(metaBuffer);
      break;
    default:
      throw new Error(`Segment with type <${SegmentType[typeCode]}>,
      code <${typeCode} is not implemented yet`);
  }
  return segment;
}
*/
// export {SegmentType, SegmentTypeKeys, SegmentTypeObject}
/**
 * Extract the segment Type code from the metadata frame
 * @param {Buffer} metaBuffer metadata frame
 * @return {number} a numeric code describing the type of segment
 */
function extractType(metaBuffer:Buffer):number {
  // bit shift right to get only the value of 3 first bits.
  return metaBuffer.readUInt8() >>> 5;
}
