"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Status = exports.Command = exports.buildSendRR = exports.buildUnRegSession = exports.buildRegSession = exports.buildListIdentity = exports.buildNOP = void 0;
/* eslint-disable no-unused-vars */
const enip_header_1 = require("./enip_header");
const enip_command_1 = require("./enip_command");
Object.defineProperty(exports, "Command", { enumerable: true, get: function () { return enip_command_1.EnipCommand; } });
const enip_status_1 = require("./enip_status");
Object.defineProperty(exports, "Status", { enumerable: true, get: function () { return enip_status_1.EnipStatus; } });
/**
 * Build an NOP command header
 * @return {EnipHeader} an instance describin NOP header
 */
function buildNOP() {
    return new enip_header_1.EnipHeader(enip_command_1.EnipCommand.NOP, // NOP command
    0, // data length : 0
    0, // session id : 0,
    enip_status_1.EnipStatus.SUCCESS, // status : 0
    Buffer.alloc(8), // context : empty buffer size 8
    0); // options flags : 0
}
exports.buildNOP = buildNOP;
/**
 * Build an ListIdentity command header
 * @return {EnipHeader} specific header for NOP command
 */
function buildListIdentity() {
    return new enip_header_1.EnipHeader(enip_command_1.EnipCommand.ListIdentity, // ListIdentity command
    0, // data length : 0
    0, // session id : 0,
    enip_status_1.EnipStatus.SUCCESS, // status : 0
    Buffer.alloc(8), // context : empty buffer size 8
    0); // options flags : 0
}
exports.buildListIdentity = buildListIdentity;
/**
 * Build an RegisterSession command header
 * @return {EnipHeader} specific header for NOP command
 */
function buildRegSession() {
    return new enip_header_1.EnipHeader(enip_command_1.EnipCommand.RegisterSession, // ListIdentity command
    4, // data length : 0
    0, // session id : 0,
    enip_status_1.EnipStatus.SUCCESS, // status : 0
    Buffer.alloc(8), // context : empty buffer size 8
    0); // options flags : 0
}
exports.buildRegSession = buildRegSession;
/**
 * Build an UnregisterSession command header
 * @param {number} session session id
 * @return {EnipHeader} specific header for NOP command
 */
function buildUnRegSession(session) {
    return new enip_header_1.EnipHeader(enip_command_1.EnipCommand.UnregisterSession, // ListIdentity command
    0, // data length : 0
    session, // session id : 0,
    enip_status_1.EnipStatus.SUCCESS, // status : 0
    Buffer.alloc(8), // context : empty buffer size 8
    0); // options flags : 0
}
exports.buildUnRegSession = buildUnRegSession;
/**
 * Build an UnregisterSession command header
 * @param {number} session session id
 * @param {number} dataLength lenght of ecapsulated data in bytes
 * @return {EnipHeader} specific header for NOP command
 */
function buildSendRR(session, dataLength) {
    return new enip_header_1.EnipHeader(enip_command_1.EnipCommand.SendRRData, // ListIdentity command
    dataLength, // data length : 0
    session, // session id : 0,
    enip_status_1.EnipStatus.SUCCESS, // status : 0
    Buffer.alloc(8), // context : empty buffer size 8
    0); // options flags : 0
}
exports.buildSendRR = buildSendRR;
exports.default = enip_header_1.EnipHeader;
