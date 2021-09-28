/* eslint-disable no-unused-vars */
import {EnipHeader,
  EnipHeaderJSONObject} from './enip_header';
import {EnipCommand} from './enip_command';
import {EnipStatus, ENIPStatusMsg} from './enip_status';

/**
 * Build an NOP command header
 * @return {EnipHeader} an instance describin NOP header
 */
export function buildNOP() : EnipHeader {
  return new EnipHeader(
      EnipCommand.NOP, // NOP command
      0, // data length : 0
      0, // session id : 0,
      EnipStatus.SUCCESS, // status : 0
      Buffer.alloc(8), // context : empty buffer size 8
      0);// options flags : 0
}

/**
 * Build an ListIdentity command header
 * @return {EnipHeader} specific header for NOP command
 */
export function buildListIdentity() : EnipHeader {
  return new EnipHeader(
      EnipCommand.ListIdentity, // ListIdentity command
      0, // data length : 0
      0, // session id : 0,
      EnipStatus.SUCCESS, // status : 0
      Buffer.alloc(8), // context : empty buffer size 8
      0);// options flags : 0
}

/**
 * Build an RegisterSession command header
 * @return {EnipHeader} specific header for NOP command
 */
export function buildRegSession() : EnipHeader {
  return new EnipHeader(
      EnipCommand.RegisterSession, // ListIdentity command
      4, // data length : 0
      0, // session id : 0,
      EnipStatus.SUCCESS, // status : 0
      Buffer.alloc(8), // context : empty buffer size 8
      0);// options flags : 0
}

/**
 * Build an UnregisterSession command header
 * @param {number} session session id
 * @return {EnipHeader} specific header for NOP command
 */
export function buildUnRegSession(session:number) : EnipHeader {
  return new EnipHeader(
      EnipCommand.UnregisterSession, // ListIdentity command
      0, // data length : 0
      session, // session id : 0,
      EnipStatus.SUCCESS, // status : 0
      Buffer.alloc(8), // context : empty buffer size 8
      0);// options flags : 0
}

/**
 * Build an UnregisterSession command header
 * @param {number} session session id
 * @param {number} dataLength lenght of ecapsulated data in bytes
 * @return {EnipHeader} specific header for NOP command
 */
export function buildSendRR(session:number,
    dataLength:number) : EnipHeader {
  return new EnipHeader(
      EnipCommand.SendRRData, // ListIdentity command
      dataLength, // data length : 0
      session, // session id : 0,
      EnipStatus.SUCCESS, // status : 0
      Buffer.alloc(8), // context : empty buffer size 8
      0);// options flags : 0
}

export default EnipHeader;

export {
  EnipCommand as Command,
  EnipStatus as Status,
  EnipHeaderJSONObject as EnipHeaderJSON,
};

