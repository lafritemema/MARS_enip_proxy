import {Socket} from 'net';

export interface TcpMsg {
  id:string,
  data:Buffer
}

/**
 * class describing a TcpClient
 */
export class TcpClient extends Socket {
  private _msgQueue:Array<TcpMsg>=[];
  private _sockAvailable:Boolean=true;
  private _currentMsg:TcpMsg|undefined;

  /**
   * TcpClient instance constructor
   */
  constructor() {
    super();
    this.configure();
  }

  /**
   * configure event handler
   */
  private configure() {
    this.on('drain', this.drainEventHandler);
    this.on('writedata', this.writeDataEventHandler);
    this.on('data', this.dataEventHandler);
  }

  /**
   * function to handle socket drain event
   */
  private drainEventHandler() {
    // switch socket available to false until data reception
    this._sockAvailable = false;
  }

  /**
   * function to handle custom writedata event
   */
  private writeDataEventHandler() {
    // update the currentMsg = > get the first msg in queue
    this._currentMsg = <TcpMsg> this._msgQueue.shift();
    // write it on the socket
    this.write(this._currentMsg.data);
  }

  /**
  * function to handle socket data event
  * @param {Buffer} data data send by server
  */
  private dataEventHandler(data:Buffer) {
    // build a tcpMsg with same id as current
    this.emit('tcpdata', data, (<TcpMsg> this._currentMsg).id);
    this._sockAvailable = true;
    if (this._msgQueue.length>0) {
      this.emit('writedata');
    }
  }

  /**
   * send a message on the socket using the TCP protocol
   * @param {Buffer} data data to send on TCP connection stream
   * @param {string} reqId request id
   */
  public send(data:Buffer, reqId:string) {
    this._msgQueue.push({
      id: reqId,
      data: data,
    });
    if (this._sockAvailable) {
      this.emit('writedata');
    }
  }
}
