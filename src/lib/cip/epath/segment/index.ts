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
  // get the segment type
  const stcode: number = extractType(metaBuffer);
  checkSegmentType(stcode);

  // get the class according to the segment type
  const segmentClass = SegmentTypeObject[<SegmentTypeKeys>SegmentType[stcode]];
  // return the typed segment instance using the createTypedInstance function
  return createTypedInstance(segmentClass, metaBuffer);
}

/**
 * Generic function to create a typed segment instance from a metaBuffer
 * @param {class} s  typed segment class
 * @param {Buffer} metaBuffer buffer describing the metadata
 * @return {Segment} a typed segment heritate from Segment
 */
function createTypedInstance<S extends Segment>(s:new() => S,
    metaBuffer:Buffer):S {
  // eslint-disable-next-line new-cap
  const typedSegment = new s();
  typedSegment.parseMeta(metaBuffer);
  return typedSegment;
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
