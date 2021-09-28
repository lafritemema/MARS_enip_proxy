/* eslint-disable no-unused-vars */

export interface EnipStatusObject {
  state:number,
  message:string
}

export enum EnipStatus {
  SUCCESS = 0x00,
  FAIL_INVALID_COMMAND = 0x01,
  FAIL_INSUFFICIENT_MEMORY = 0x02,
  FAIL_INCORRECT_DATA = 0x03,
  FAIL_INVALID_SESSION = 0x64,
  FAIL_INVALID_LENGTH = 0x65,
  FAIL_UNSUPPORTED_PROTOCOL = 0x69
};

export const ENIPStatusMsg:Record<string, EnipStatusObject> = {
  SUCCESS: {state: 1, message: 'SUCCESS'},
  FAIL_INVALID_COMMAND: {state: 0,
    message: 'FAIL: Sender issued an invalid ecapsulation command.'},
  FAIL_INSUFFICIENT_MEMORY: {state: 0,
    message: 'FAIL: Insufficient memory resources to handle command.'},
  FAIL_INCORRECT_DATA: {state: 0,
    message: 'FAIL: Poorly formed or incorrect data in encapsulation packet.'},
  FAIL_INVALID_SESSION: {state: 0,
    message: 'FAIL: Originator used an invalid session handle.'},
  FAIL_INVALID_LENGTH: {state: 0,
    message: 'FAIL: Target received a message of invalid length.'},
  FAIL_UNSUPPORTED_PROTOCOL: {state: 0,
    message: 'FAIL: Unsupported encapsulation protocol revision.'},
};
