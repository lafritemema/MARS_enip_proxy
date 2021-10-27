"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogicalProcessor = exports.extractLogicalFormat = exports.LogicalFormatPorcessor = exports.LogicalFormat = void 0;
/**
 * @enum LogicalFormatEnum
 * enum to enumerate each type of logical segment
 * a LogicalFormatObject is associated for each type
 */
var LogicalFormat;
(function (LogicalFormat) {
    LogicalFormat[LogicalFormat["BIT_8"] = 0] = "BIT_8";
    LogicalFormat[LogicalFormat["BIT_16"] = 1] = "BIT_16";
    LogicalFormat[LogicalFormat["BIT_32"] = 2] = "BIT_32";
    LogicalFormat[LogicalFormat["RESERVED"] = 3] = "RESERVED";
})(LogicalFormat = exports.LogicalFormat || (exports.LogicalFormat = {}));
/**
 * @enum _LogicalFormatProcessor
 * constant to enumerate size and processing informations
 * according logical segment type
 */
exports.LogicalFormatPorcessor = {
    'BIT_8': { size: 1,
        read: Buffer.prototype.readUInt8,
        write: Buffer.prototype.writeUInt8 },
    'BIT_16': { size: 2,
        read: Buffer.prototype.readUInt16LE,
        write: Buffer.prototype.writeUInt16LE },
    'BIT_32': { size: 4,
        read: Buffer.prototype.readUInt32LE,
        write: Buffer.prototype.writeUInt32LE },
    'RESERVED': { size: 0,
        read: Buffer.prototype.readUInt32LE,
        write: Buffer.prototype.writeUInt32LE },
};
/**
 * Check if the Logical Segment Format code is conform
 * @param {number} formatCode format code
 */
function checkFormatCode(formatCode) {
    if (LogicalFormat[formatCode] == undefined) {
        // eslint-disable-next-line max-len
        throw new Error(`ERROR: The logical segment format <${formatCode}> is not a available logical segment format`);
    }
}
/**
 * Extract the logical segment format code from the metadata frame
 * @param {Buffer} metaBuffer metadata frame
 * @return {number} a numeric code describing the logical segment format
*/
function extractLogicalFormat(metaBuffer) {
    // apply a binary filter (00000011)
    // to get the logical format (bit 7 and 8 of buffer)
    const lfcode = metaBuffer.readUInt8() & 3;
    // ENHANCE : integrate best optimized code check
    checkFormatCode(lfcode);
    return lfcode;
}
exports.extractLogicalFormat = extractLogicalFormat;
function getLogicalProcessor(formatCode) {
    return exports.LogicalFormatPorcessor[LogicalFormat[formatCode]];
}
exports.getLogicalProcessor = getLogicalProcessor;
