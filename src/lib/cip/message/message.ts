import {EPath} from '../epath';
import {MessageType} from './message_type';
import {MessageService} from './message_service';
import {ResponseStatus} from './response_status';

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

      if (type == MessageType.RESPONSE) {
        return ResponseMessage._parseResponse(service, dataBuffer);
      } else {
        return RequestMessage._parseRequest(service, dataBuffer);
      }
    }
    public abstract toJSON():object;
    public abstract encode():Buffer;
    public abstract get length():number;
}

/**
 * extract the message type code (Request:0/Response:1) from the Type&Service code
 * @param {number} code Type&Service code
 * @return {number} type code
 */
function extractType(code:number) : number {
  // apply a filter 10000000
  // and a right shift of 7
  return (code & 128) >>> 7;
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
  if (MessageService[serviceCode] == undefined) {
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
   * Get the message lenght in byte
   * @return {number} message length in byte
   */
  public get length():number {
    return this._data.length + this._path.lenght + 2;
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

    // ENHANCE : implement BufferIterator
    return new RequestMessage(service, path, data);
  }

  /**
   * Convert the request message instance to JSON
   * @return {object} a message JSON representation
   */
  public toJSON() {
    return {
      type: MessageType[this._type],
      service: MessageService[this._service],
      path: this._path.toJSON(),
      data: this._data.toString('hex'),
    };
  }

  /**
   * Encode the RequestMessage instance in a Buffer
   * @return {Buffer} a buffer describing the RequestMessage instance
   */
  public encode():Buffer {
    // encode a metaBuffer with service + path size
    const metaBuffer = Buffer.alloc(2);
    metaBuffer.writeUInt8(this._service, 0);
    metaBuffer.writeUInt8(this._path.pathSize, 1);

    // get the epath buffer
    const epathBuffer = this._path.encode();

    // return buffer with metadata + epath data + data
    return Buffer.concat([metaBuffer, epathBuffer, this._data]);
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
    super(MessageType.RESPONSE, service);
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
   * Get the message lenght in byte
   * @return {number} message length in byte
   */
  public get length():number {
    return this._data.length + this._addStatus.length + 4;
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

    // ENHANCE : implement BufferIterator
    return new ResponseMessage(service, status, data, addStatus);
  }

  /**
   * Convert the response message instance to JSON
   * @return {object} a message JSON representation
   */
  public toJSON() {
    return {
      type: MessageType[this._type],
      service: MessageService[this._service],
      // @ts-ignore
      status: ResponseStatus[this._status],
      addStatus: this._addStatus.toString('hex'),
      data: this._data.toString('hex'),
    };
  }

  /**
   * Encode the ResponseMessage instance in a Buffer
   * @return {Buffer} a buffer describing the ResponseMessage instance
   */
  public encode():Buffer {
    // encode metabuffer with service + reserved octet + status + size additionnal status
    // size 4 byte
    const metaBuffer = Buffer.alloc(4);

    // or operation to set the service first bit to 1 (response value);
    const serviceRespCode = this._service | 128;

    metaBuffer.writeUInt8(serviceRespCode, 0);
    metaBuffer.writeUInt8(this._status, 2);
    metaBuffer.writeUInt8(this._addStatus.length, 3);

    // return buffer with metadata + addstatus data + data
    return Buffer.concat([metaBuffer, this._addStatus, this._data]);
  }
}

/**
 * Check if the Message Type code is conform
 * @param {number} statusCode type code
 */
function checkStatusCode(statusCode:number):void {
  // @ts-ignore
  if (ResponseStatus[statusCode] == undefined) {
    // eslint-disable-next-line max-len
    throw new Error(`ERROR: The message status <${statusCode}> is not an available message status`);
  }
}

