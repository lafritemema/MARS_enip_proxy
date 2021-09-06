/* eslint-disable no-unused-vars */
export enum MessageService {
  GET_ATTRIBUTE_ALL= 0x01,
  GET_ATTRIBUTE_SINGLE= 0x0e,
  RESET= 0x05,
  START= 0x06,
  STOP= 0x07,
  CREATE= 0x08,
  DELETE= 0x09,
  MULTIPLE_SERVICE_PACKET= 0x0a,
  APPLY_ATTRIBUTES= 0x0d,
  SET_ATTRIBUTE_SINGLE= 0x10,
  FIND_NEXT= 0x11,
  READ_TAG= 0x4c,
  WRITE_TAG= 0x4d,
  READ_TAG_FRAGMENTED= 0x52,
  WRITE_TAG_FRAGMENTED= 0x53,
  READ_MODIFY_WRITE_TAG= 0x4e
};

/**
 * extract the message service code from the Type&Service code
 * @param {number} code Type&Service code
 * @return {number} service code
 */
export function extractService(code:number) {
  // apply a filter 01111111
  return code & 0x7f;
}

/**
 * Check if the Message Type code is conform
 * @param {number} serviceCode type code
 */
export function checkServiceCode(serviceCode:number) {
  if (MessageService[serviceCode] == undefined) {
    // eslint-disable-next-line max-len
    throw new Error(`ERROR: The message service <${serviceCode}> is not an available message service`);
  }
}
