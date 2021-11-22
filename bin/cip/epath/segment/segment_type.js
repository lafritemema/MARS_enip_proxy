"use strict";
/* eslint-disable no-unused-vars */
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractSegmentType = exports.SegmentType = void 0;
// type SegmentTypeKeys = keyof typeof SegmentTypeObject;
var SegmentType;
(function (SegmentType) {
    // PORT=0,
    SegmentType[SegmentType["LOGICAL"] = 1] = "LOGICAL";
    /* NETWORK=2,
    SYMBOLIC=3,
    DATA=4,
    DATA_TYPE_CONST=5,
    DATA_TYPE_ELEM=6,
    RESERVED=7 */
})(SegmentType = exports.SegmentType || (exports.SegmentType = {}));
/**
 * parse the metabuffer to extract the segment type
 * @param {Buffer} metaBuffer buffer containing the segment type
 * @return {number} the segment type code
 */
function extractSegmentType(metaBuffer) {
    const typeCode = extractType(metaBuffer);
    checkSegmentType(typeCode);
    return typeCode;
}
exports.extractSegmentType = extractSegmentType;
/**
 * Check if the Logical Segment Format code is conform
 * @param {number} typeCode format code
 */
function checkSegmentType(typeCode) {
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
function extractType(metaBuffer) {
    // bit shift right to get only the value of 3 first bits.
    return metaBuffer.readUInt8() >>> 5;
}
