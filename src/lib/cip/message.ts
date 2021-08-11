import {Path} from './epath';
import {Service} from './service';

/**
 * Class describing a CIP message
 * @class
 */
export class Message {
    private _service : number;
    private _type : number;
    private _path : Path | undefined;
    private _data : Buffer;
    private _status : number | undefined;
    private _addStatus : Buffer | undefined;

    /**
     * Message object constructor
     * @param {number} type type of message => REQUEST or RESPONSE
     * @param {number} service service used
     * @param {Path|undefined} path object path
     * @param {Buffer} data buffer describing the data
     * @param {number} status status for response
     * @param {Buffer} addStatus additionnal status buffer
     */
    public constructor(type:number,
        service:number,
        path?:Path,
        data:Buffer=Buffer.alloc(0), //empty buffer by default
        status?:number,
        addStatus?:Buffer) {
      this._type = type;
      this._service = service;
      this._path = path;
      this._status = status;
      this._data = data;
      this._addStatus = addStatus;
    }

    /**
     * get the message service
     * @return {string} message service
     */
    public getService() : string {
      return Service[this._service];
    }
    /**
     * set the message service
     * @param {number} service message service
     */
    public setService(service:number) {
      this._service = service;
    }

    /**
     * get the message type
     * @return {string} message type ('RESPONSE' or 'REQUEST')
     */
    public getType():string {
      return this._type == 1 ? 'RESPONSE' : 'REQUEST';
    }

    /**
     * get the message path
     * @return {Path} the message path
     */
    public getPath():Path | undefined {
      return this._path;
    }
    /**
     * Set the message path
     * @param {Path} path message path
     */
    public setPath(path:Path) {
      this._path = path;
    }

    /**
     * Set the message data
     * @param {number} data message data
     */
    public set data(data:Buffer) {
      this._data = data;
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
     * @return {Message} a message objet
     */
    public parse(buffer:Buffer) {
      let path = undefined;
      let data = null;
      let status = undefined;
      let addStatus = undefined;

      const type = extractType(buffer.readUInt8(0));
      const service = extractService(buffer.readUInt8(0));

      if (type == 0) // if type => Request
      {
        const pathSize = buffer.readUInt8(1);
        const pathBuffer = buffer.slice(2, 2 + (pathSize + 2) + 1);
        path = Path.parse(pathBuffer);
        data = buffer.slice(2 + (pathSize + 2) + 1);

        return new Message(type, service, path, data);
      } else { // else Response message
        // const reserved = buffer.readUInt8(1); // reserved shall be 00
        status = buffer.readUInt8(2);
        const addStatusSize = buffer.readUInt8(3);
        if (addStatusSize>0) {
          addStatus = buffer.slice(4, 4+(addStatusSize*2)+ 1);
          data = buffer.slice(4+(addStatusSize*2)+ 1);
        } else {
          data = buffer.slice(4);
        }

        return new Message(type, service, path, data, status, addStatus);
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
