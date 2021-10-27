"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractType = exports.checkTypeCode = exports.MessageType = void 0;
/* eslint-disable no-unused-vars */
var MessageType;
(function (MessageType) {
    MessageType[MessageType["REQUEST"] = 0] = "REQUEST";
    MessageType[MessageType["RESPONSE"] = 1] = "RESPONSE";
})(MessageType = exports.MessageType || (exports.MessageType = {}));
/**
 * Check if the Message Type code is conform
 * @param {number} typeCode type code
 */
function checkTypeCode(typeCode) {
    if (MessageType[typeCode] == undefined) {
        // eslint-disable-next-line max-len
        throw new Error(`ERROR: The message type <${typeCode}> is not an available message type`);
    }
}
exports.checkTypeCode = checkTypeCode;
/**
 * extract the message type code (Request:0/Response:1) from the Type&Service code
 * @param {number} code Type&Service code
 * @return {number} type code
 */
function extractType(code) {
    // apply a filter 10000000
    // and a right shift of 7
    return (code & 128) >>> 7;
}
exports.extractType = extractType;
