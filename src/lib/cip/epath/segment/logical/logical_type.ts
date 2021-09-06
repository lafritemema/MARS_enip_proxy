/* eslint-disable no-unused-vars */
/**
 * @enum LogicalType
 * Constant to enumerate each segement logical type
 */

export enum LogicalType{
    CLASS_ID=0,
    INSTANCE_ID=1,
    MEMBER_ID=2,
    CONNECTION_POINT=3,
    ATTRIBUTE_ID=4,
    SPECIAL=5,
    SERVICE_ID=6,
    RESERVED=7
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

/**
 * Extract the logical segment type code from the metadata frame
 * @param {Buffer} metaBuffer metadata frame
 * @return {number} a numeric code describing the logical segment type
 */
export function extractLogicalType(metaBuffer:Buffer) : number {
  // apply a binary filter (00011100)
  // and a right shift of 2
  // to get the logical type (bit 4 to 6 of buffer)
  const ltcode = (metaBuffer.readUInt8() & 0x1c) >>> 2;
  // ENHANCE : integrate best optimized code check
  checkTypeCode(ltcode);

  return ltcode;
}

/**
 * Build the logical type code for metadata frame generation
 * @param {number} typeCode logical segment type
 * @return {number} code for metadata frame generation
 */
export function encodeLogicalType(typeCode:number):number {
  return typeCode << 2;
}
