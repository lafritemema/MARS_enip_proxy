"use strict";
/* eslint-disable no-unused-vars */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENIPStatusMsg = exports.EnipStatus = void 0;
var EnipStatus;
(function (EnipStatus) {
    EnipStatus[EnipStatus["SUCCESS"] = 0] = "SUCCESS";
    EnipStatus[EnipStatus["FAIL_INVALID_COMMAND"] = 1] = "FAIL_INVALID_COMMAND";
    EnipStatus[EnipStatus["FAIL_INSUFFICIENT_MEMORY"] = 2] = "FAIL_INSUFFICIENT_MEMORY";
    EnipStatus[EnipStatus["FAIL_INCORRECT_DATA"] = 3] = "FAIL_INCORRECT_DATA";
    EnipStatus[EnipStatus["FAIL_INVALID_SESSION"] = 100] = "FAIL_INVALID_SESSION";
    EnipStatus[EnipStatus["FAIL_INVALID_LENGTH"] = 101] = "FAIL_INVALID_LENGTH";
    EnipStatus[EnipStatus["FAIL_UNSUPPORTED_PROTOCOL"] = 105] = "FAIL_UNSUPPORTED_PROTOCOL";
})(EnipStatus = exports.EnipStatus || (exports.EnipStatus = {}));
;
exports.ENIPStatusMsg = {
    SUCCESS: { state: 1, message: 'SUCCESS' },
    FAIL_INVALID_COMMAND: { state: 0,
        message: 'FAIL: Sender issued an invalid ecapsulation command.' },
    FAIL_INSUFFICIENT_MEMORY: { state: 0,
        message: 'FAIL: Insufficient memory resources to handle command.' },
    FAIL_INCORRECT_DATA: { state: 0,
        message: 'FAIL: Poorly formed or incorrect data in encapsulation packet.' },
    FAIL_INVALID_SESSION: { state: 0,
        message: 'FAIL: Originator used an invalid session handle.' },
    FAIL_INVALID_LENGTH: { state: 0,
        message: 'FAIL: Target received a message of invalid length.' },
    FAIL_UNSUPPORTED_PROTOCOL: { state: 0,
        message: 'FAIL: Unsupported encapsulation protocol revision.' },
};
