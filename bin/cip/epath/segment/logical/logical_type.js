"use strict";
/* eslint-disable no-unused-vars */
/**
 * @enum LogicalType
 * Constant to enumerate each segement logical type
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeLogicalType = exports.extractLogicalType = exports.LogicalType = void 0;
var LogicalType;
(function (LogicalType) {
    LogicalType[LogicalType["CLASS_ID"] = 0] = "CLASS_ID";
    LogicalType[LogicalType["INSTANCE_ID"] = 1] = "INSTANCE_ID";
    LogicalType[LogicalType["MEMBER_ID"] = 2] = "MEMBER_ID";
    LogicalType[LogicalType["CONNECTION_POINT"] = 3] = "CONNECTION_POINT";
    LogicalType[LogicalType["ATTRIBUTE_ID"] = 4] = "ATTRIBUTE_ID";
    LogicalType[LogicalType["SPECIAL"] = 5] = "SPECIAL";
    LogicalType[LogicalType["SERVICE_ID"] = 6] = "SERVICE_ID";
    LogicalType[LogicalType["RESERVED"] = 7] = "RESERVED";
})(LogicalType = exports.LogicalType || (exports.LogicalType = {}));
/**
* Check if the Logical Segment Type code is conform
* @param {number} typeCode type code
*/
function checkTypeCode(typeCode) {
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
function extractLogicalType(metaBuffer) {
    // apply a binary filter (00011100)
    // and a right shift of 2
    // to get the logical type (bit 4 to 6 of buffer)
    const ltcode = (metaBuffer.readUInt8() & 0x1c) >>> 2;
    // ENHANCE : integrate best optimized code check
    checkTypeCode(ltcode);
    return ltcode;
}
exports.extractLogicalType = extractLogicalType;
/**
 * Build the logical type code for metadata frame generation
 * @param {number} typeCode logical segment type
 * @return {number} code for metadata frame generation
 */
function encodeLogicalType(typeCode) {
    return typeCode << 2;
}
exports.encodeLogicalType = encodeLogicalType;
