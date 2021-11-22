"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkServiceCode = exports.extractService = exports.MessageService = void 0;
/* eslint-disable no-unused-vars */
var MessageService;
(function (MessageService) {
    MessageService[MessageService["GET_ATTRIBUTE_ALL"] = 1] = "GET_ATTRIBUTE_ALL";
    MessageService[MessageService["GET_ATTRIBUTE_SINGLE"] = 14] = "GET_ATTRIBUTE_SINGLE";
    MessageService[MessageService["GET_ATTRIBUTE_BLOCK"] = 50] = "GET_ATTRIBUTE_BLOCK";
    MessageService[MessageService["RESET"] = 5] = "RESET";
    MessageService[MessageService["START"] = 6] = "START";
    MessageService[MessageService["STOP"] = 7] = "STOP";
    MessageService[MessageService["CREATE"] = 8] = "CREATE";
    MessageService[MessageService["DELETE"] = 9] = "DELETE";
    MessageService[MessageService["MULTIPLE_SERVICE_PACKET"] = 10] = "MULTIPLE_SERVICE_PACKET";
    MessageService[MessageService["APPLY_ATTRIBUTES"] = 13] = "APPLY_ATTRIBUTES";
    MessageService[MessageService["SET_ATTRIBUTE_SINGLE"] = 16] = "SET_ATTRIBUTE_SINGLE";
    MessageService[MessageService["SET_ATTRIBUTE_ALL"] = 2] = "SET_ATTRIBUTE_ALL";
    MessageService[MessageService["SET_ATTRIBUTE_BLOCK"] = 51] = "SET_ATTRIBUTE_BLOCK";
    MessageService[MessageService["FIND_NEXT"] = 17] = "FIND_NEXT";
    MessageService[MessageService["READ_TAG"] = 76] = "READ_TAG";
    MessageService[MessageService["WRITE_TAG"] = 77] = "WRITE_TAG";
    MessageService[MessageService["READ_TAG_FRAGMENTED"] = 82] = "READ_TAG_FRAGMENTED";
    MessageService[MessageService["WRITE_TAG_FRAGMENTED"] = 83] = "WRITE_TAG_FRAGMENTED";
    MessageService[MessageService["READ_MODIFY_WRITE_TAG"] = 78] = "READ_MODIFY_WRITE_TAG";
})(MessageService = exports.MessageService || (exports.MessageService = {}));
;
/**
 * extract the message service code from the Type&Service code
 * @param {number} code Type&Service code
 * @return {number} service code
 */
function extractService(code) {
    // apply a filter 01111111
    return code & 0x7f;
}
exports.extractService = extractService;
/**
 * Check if the Message Type code is conform
 * @param {number} serviceCode type code
 */
function checkServiceCode(serviceCode) {
    if (MessageService[serviceCode] == undefined) {
        // eslint-disable-next-line max-len
        throw new Error(`ERROR: The message service <${serviceCode}> is not an available message service`);
    }
}
exports.checkServiceCode = checkServiceCode;
