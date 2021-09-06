/* eslint-disable no-unused-vars */
import {EnipHeader} from './header/enip_header';
import {Item} from './data/item';
import {EnipCPF} from './data/cpf';
import {ListIdentity} from './data/list_identity';
import {RegisterSession} from './data/register_session';
import {SendRRData} from './data/send_RR_data';
import {EnipCommand} from './header/enip_command';
import {EnipStatus} from './header/enip_status';

const ENIPData = {
  ListIdentity: ListIdentity,
  RegisterSession: RegisterSession,
  SendRR: SendRRData,
  CPF: EnipCPF,
  Item: Item,
};

const ENIPHeader = {
  Header: EnipHeader,
  Command: EnipCommand,
  Status: EnipStatus,
  buildNOP() : EnipHeader {
    return new EnipHeader(
        EnipCommand.NOP, // NOP command
        0, // data length : 0
        0, // session id : 0,
        EnipStatus.SUCCESS, // status : 0
        Buffer.alloc(8), // context : empty buffer size 8
        0);// options flags : 0
  },

  /**
   * Build an ListIdentity command header
   * @return {EnipHeader} specific header for NOP command
   */
  buildListIdentity() : EnipHeader {
    return new EnipHeader(
        EnipCommand.ListIdentity, // ListIdentity command
        0, // data length : 0
        0, // session id : 0,
        EnipStatus.SUCCESS, // status : 0
        Buffer.alloc(8), // context : empty buffer size 8
        0);// options flags : 0
  },

  /**
   * Build an RegisterSession command header
   * @return {EnipHeader} specific header for NOP command
   */
  buildRegSession() : EnipHeader {
    return new EnipHeader(
        EnipCommand.RegisterSession, // ListIdentity command
        4, // data length : 0
        0, // session id : 0,
        EnipStatus.SUCCESS, // status : 0
        Buffer.alloc(8), // context : empty buffer size 8
        0);// options flags : 0
  },

  /**
   * Build an UnregisterSession command header
   * @param {number} session session id
   * @return {EnipHeader} specific header for NOP command
   */
  buildUnRegSession(session:number) : EnipHeader {
    return new EnipHeader(
        EnipCommand.UnregisterSession, // ListIdentity command
        0, // data length : 0
        session, // session id : 0,
        EnipStatus.SUCCESS, // status : 0
        Buffer.alloc(8), // context : empty buffer size 8
        0);// options flags : 0
  },

  /**
   * Build an UnregisterSession command header
   * @param {number} session session id
   * @param {number} dataLength lenght of ecapsulated data in bytes
   * @return {EnipHeader} specific header for NOP command
   */
  buildSendRR(session:number,
      dataLength:number) : EnipHeader {
    return new EnipHeader(
        EnipCommand.SendRRData, // ListIdentity command
        dataLength, // data length : 0
        session, // session id : 0,
        EnipStatus.SUCCESS, // status : 0
        Buffer.alloc(8), // context : empty buffer size 8
        0);// options flags : 0
  },
};

export {
  ENIPHeader,
  ENIPData,
};
