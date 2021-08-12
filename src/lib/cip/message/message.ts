import {Status} from '../../enip';
import {EPath} from '../epath';
import {MessageType} from './message_type';
import {Service} from './service';

/**
 * abstract class describing a CIP message
 * @class Message
 */
export abstract class Message {
    protected _service : number;
    protected _type : number;

    /**
     * Message object constructor
     * @param {number} type type of message => REQUEST or RESPONSE
     * @param {number} service service used
     */
    public constructor(type:number, service:number) {
      checkTypeCode(type);
      checkServiceCode(service);

      this._type = type;
      this._service = service;
    }

    /**
     * get the message service
     * @return {number} message service
     */
    public get service() : number {
      return this.service;
    }
    /**
     * set the message service
     * @param {number} service message service
     */
    public set service(service:number) {
      checkServiceCode(service);
      this._service = service;
    }

    /**
     * get the message type
     * @return {string} message type ('RESPONSE' or 'REQUEST')
     */
    public get type():number {
      return this._type;
    }
    /**
     * set the message type
     * @param {number} type message type
     */
    public set type(type:number) {
      checkTypeCode(type);
      this._type=type;
    }

    /**
     * Encode the message to a data frame
     * @return {Buffer} buffer describing the message
     */
    public encode():Buffer {
      return Buffer.from([0x00]);
    }

    /**
     * Parse the CIP message buffer
     * @param {Buffer} buffer buffer describing the cip message
     * @return {Message} a Message instance
     */
    public static parse(buffer:Buffer) : Message {
      const type = extractType(buffer.readUInt8(0));
      const service = extractService(buffer.readUInt8(0));

      checkTypeCode(type);
      checkServiceCode(service);

      const dataBuffer = buffer.slice(1);

      if (type == MessageType.REPONSE) {
        return ResponseMessage._parseResponse(service, dataBuffer);
      } else {
        return RequestMessage._parseRequest(service, dataBuffer);
      }
    }
}

/**
 * extract the message type code (Request:0/Response:1) from the Type&Service code
 * @param {number} code Type&Service code
 * @return {number} type code
 */
function extractType(code:number) : number {
  // apply a filter 10000000
  // and a right shift of 7
  return (code & 80) >>> 7;
}

/**
 * extract the message service code from the Type&Service code
 * @param {number} code Type&Service code
 * @return {number} service code
 */
function extractService(code:number) {
  // apply a filter 01111111
  return code & 0x7f;
}

/**
 * Check if the Message Type code is conform
 * @param {number} typeCode type code
 */
function checkTypeCode(typeCode:number) {
  if (MessageType[typeCode] == undefined) {
    // eslint-disable-next-line max-len
    throw new Error(`ERROR: The message type <${typeCode}> is not an available message type`);
  }
}

/**
 * Check if the Message Type code is conform
 * @param {number} serviceCode type code
 */
function checkServiceCode(serviceCode:number) {
  if (Service[serviceCode] == undefined) {
    // eslint-disable-next-line max-len
    throw new Error(`ERROR: The message service <${serviceCode}> is not an available message service`);
  }
}

/**
 * class describing a CIP request message
 * @class RequestMessage
 */
export class RequestMessage extends Message {
  private _path : EPath;
  private _data : Buffer;

  /**
   * Request message constructor
   * @param {number} service service used
   * @param {EPath} path object path
   * @param {Buffer} data buffer describing the data
   */
  public constructor(service:number,
      path:EPath,
      data:Buffer=Buffer.alloc(0)) {// empty buffer by default
    super(MessageType.REQUEST, service);
    this._path = path;
    this._data = data;
  }

  /**
     * get the message path
     * @return {EPath} the message path
     */
  public get epath():EPath {
    return this._path;
  }

  /**
   * Set the message path
   * @param {EPath} path message path
   */
  public set epath(path:EPath) {
    this._path = path;
  }

  /**
   * Set the message data
   * @param {Buffer} data message data
   */
  public set data(data:Buffer) {
    this._data = data;
  }

  /**
   * Get the message data
   * @param {number} data message data
   */
  public get data():Buffer {
    return this._data;
  }

  /**
   * Parse the request part of the CIP message buffer
   * @param {number} service message service code
   * @param {Buffer} requestBuffer buffer describing the cip message
   * @return {Message} a Message instance
   */
  public static _parseRequest(service:number,
      requestBuffer:Buffer) : RequestMessage {
    const pathSize = requestBuffer.readUInt8(0);
    const pathBuffer = requestBuffer.slice(1, 1+(pathSize*2)+1);

    const path = EPath.parse(pathBuffer);
    const data = requestBuffer.slice(1+(pathSize * 2)+1);

    return new RequestMessage(service, path, data);
  }

  /**
   * Convert the request message instance to JSON
   * @return {object} a message JSON representation
   */
  public toJSON() {
    return {
      type: MessageType[this._type],
      service: Service[this._service],
      path: this._path.toJSON(),
      data: this._data.toString('hex'),
    };
  }
}

/**
 * class describing a CIP response message
 * @class ResponseMessage
 */
export class ResponseMessage extends Message {
  private _data : Buffer;
  private _status : number;
  private _addStatus : Buffer;

  /**
   * Response message constructor
     * @param {number} service service used
     * @param {number} status status for response
     * @param {Buffer} data buffer describing the data
     * @param {Buffer} addStatus additionnal status buffer
     */
  public constructor(service:number,
      status:number,
      data:Buffer=Buffer.alloc(0),
      addStatus:Buffer=Buffer.alloc(0)) { // empty buffer by default
    super(MessageType.REPONSE, service);
    checkStatusCode(status);

    this._data = data;
    this._status = status;
    this._addStatus = addStatus;
  }

  /**
   * Set the message data
   * @param {Buffer} data message data
   */
  public set data(data:Buffer) {
    this._data = data;
  }

  /**
   * Get the message data
   * @param {number} data message data
   */
  public get data():Buffer {
    return this._data;
  }

  /**
   * Set the message status
   * @param {number} status message status
   */
  public set status(status:number) {
    checkStatusCode(status);
    this._status = status;
  }

  /**
   * Get the message status
   * @param {number} status message status
   */
  public get status():number {
    return this._status;
  }

  /**
   * Parse the request part of the CIP message buffer
   * @param {number} service message service code
   * @param {Buffer} responseBuffer buffer describing the cip message
   * @return {Message} a Message instance
   */
  public static _parseResponse(service:number,
      responseBuffer:Buffer) : ResponseMessage {
    // const reserved = buffer.readUInt8(0); // reserved shall be 00
    const status = responseBuffer.readUInt8(1);
    const addStatusSize = responseBuffer.readUInt8(2);
    let addStatus = undefined;
    let data = null;

    if (addStatusSize>0) {
      addStatus = responseBuffer.slice(3, 3+(addStatusSize*2)+1);
      data = responseBuffer.slice(3+(addStatusSize*2)+1);
    } else {
      data = responseBuffer.slice(3);
    }

    return new ResponseMessage(service, status, data, addStatus);
  }

  /**
   * Convert the response message instance to JSON
   * @return {object} a message JSON representation
   */
  public toJSON() {
    return {
      type: MessageType[this._type],
      service: Service[this._service],
      // @ts-ignore
      status: Status[this._status],
      addStatus: this._addStatus.toString('hex'),
      data: this._data.toString('hex'),
    };
  }
}

/**
 * Check if the Message Type code is conform
 * @param {number} statusCode type code
 */
function checkStatusCode(statusCode:number) {
  // @ts-ignore
  if (Status[statusCode] == undefined) {
    // eslint-disable-next-line max-len
    throw new Error(`ERROR: The message status <${statusCode}> is not an available message status`);
  }
}
