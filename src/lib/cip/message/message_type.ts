/* eslint-disable no-unused-vars */
export enum MessageType {
  REQUEST = 0,
  RESPONSE = 1,
}

/**
 * Check if the Message Type code is conform
 * @param {number} typeCode type code
 */
export function checkTypeCode(typeCode:number) {
  if (MessageType[typeCode] == undefined) {
    // eslint-disable-next-line max-len
    throw new Error(`ERROR: The message type <${typeCode}> is not an available message type`);
  }
}

/**
 * extract the message type code (Request:0/Response:1) from the Type&Service code
 * @param {number} code Type&Service code
 * @return {number} type code
 */
export function extractType(code:number) : number {
  // apply a filter 10000000
  // and a right shift of 7
  return (code & 128) >>> 7;
}
