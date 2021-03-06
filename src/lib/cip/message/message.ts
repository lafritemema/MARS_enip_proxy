import {EPath} from '../epath/epath';
import {MessageType,
  checkTypeCode,
  extractType} from './message_type';
import {MessageService,
  checkServiceCode,
  extractService} from './message_service';
import {ResponseStatus,
  checkStatusCode} from './response_status';
import {BufferIterator} from 'utils';

/**
 * abstract class describing a CIP message
 * @class Message
 */
export abstract class Message {
    protected _service : number;
    protected _type : number;
    protected _data : Buffer

    /**
     * Message object constructor
     * @param {number} type type of message => REQUEST or RESPONSE
     * @param {number} service service used
     * @param {Buffer} data data to transfert
     */
    protected constructor(type:number,
        service:number,
        data:Buffer=Buffer.alloc(0)) {
      checkTypeCode(type);
      checkServiceCode(service);

      this._type = type;
      this._service = service;
      this._data = data;
    }

    /**
     * get the message service code
     * @return {number} message service
     */
    public get service():number {
      return this._service;
    }

    /**
     * get the message type code
     * @return {number} message type
     */
    public get type():number {
      return this._type;
    }

    /**
     * Get the message data
     * @param {number} data message data
     */
    public get data():Buffer {
      return this._data;
    }

    /**
     * get the message type
     * @return {string} message type ('RESPONSE' or 'REQUEST')
     */
    public getType():string {
      return MessageType[this._type];
    }

    /**
     * get the message service under string format
     * @return {string} message service
     */
    public getService():string {
      return MessageService[this._service];
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
 * class describing a CIP request message
 * @class RequestMessage
 */
export class RequestMessage extends Message {
  private _path : EPath;

  /**
   * Request message constructor
   * @param {number} service service used
   * @param {EPath} path object path
   * @param {Buffer} data buffer describing the data
   */
  public constructor(service:number,
      path:EPath,
      data:Buffer=Buffer.alloc(0)) {// empty buffer by default
    super(MessageType.REQUEST, service, data);
    this._path = path;
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
    // instanciate buffer iterator
    const buffIt = new BufferIterator(requestBuffer);

    // get pathsize
    const pathSize = buffIt.next().value.readUInt8();

    // browse bufferIterator to extract information about epath
    const path = EPath.parse(buffIt, pathSize);

    // get all next elements of buffer => data
    const data = buffIt.allNext().value;

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
    super(MessageType.RESPONSE, service, data);
    checkStatusCode(status);

    this._status = status;
    this._addStatus = addStatus;
  }

  /**
   * Get the message status code
   */
  public get status():number {
    return this._status;
  }

  /**
   * Get the message status under string format
   * @return {string} status message status
   */
  public getStatus():string {
    return ResponseStatus[this._status];
  }

  /**
   * return true if no error on cip message
   */
  public get isSuccess():Boolean {
    return this._status == ResponseStatus.Success;
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

    // if status = 0 => success ; else default
    if (status == 0) {
      let addStatus = undefined;
      let data = undefined;

      // ENHANCE : implement BufferIterator and tests addStatus
      if (responseBuffer.length > 3) {
        if (addStatusSize == 0) {
          data = responseBuffer.slice(3);
        } else {
          addStatus = responseBuffer.slice(3, 3+(addStatusSize*2)+1);
          if (responseBuffer.length > 3 + (addStatusSize*2) + 1) {
            data = responseBuffer.slice(3+(addStatusSize*2)+1);
          }
        }
      }

      return new ResponseMessage(service, status, data, addStatus);
    } else {
      return new ResponseMessage(service, status);
    }
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


