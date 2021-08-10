import {Segment} from './segment';
import {Type, TypeKeys, TypeObject} from './segment_type';
import {LogicalSegment} from './logical/logical_segment';


/**
 * Parse the segment metadata frame to return an typed segment object
 * which inherits segment.
 * @param {Buffer} metaBuffer metadata frame
 * @return {Segment} typed segement
 */
function parseMeta(metaBuffer:Buffer) : Segment {
  const stcode: number = extractType(metaBuffer);

  const stype: string = Type[stcode];
  // if no string linked, raise an error
  if (stype == undefined) {
    // eslint-disable-next-line max-len
    throw new Error(`ERROR: The segment type <${stcode}> is not a available segment type`);
  }

  const segment:Segment= TypeObject[<TypeKeys> stype]
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


export {Segment,
  LogicalSegment,
  parseMeta};
