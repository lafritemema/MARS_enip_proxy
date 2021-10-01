
import {Socket} from 'net';
// import * as udp from 'dgram';
import {EventEmitter} from 'events';
import * as cip from 'cip';
import EnipMessage, * as enip from 'enip';
import {DataHandler, HandledData} from './data_handler';
import {EnipRemoteMessage,
  CipEpath} from '../custom/config_interfaces'; // interface for config
import {ProxyError, TargetProtocolError} from '../proxy_error';

interface TcpError extends Error {
  errno:number,
  code:string,
  syscall:string,
  address:string,
  port:number
}

interface EnipRemoteRespMsg {
  session:number,
  command: string,
  status:{
    state:number,
    message:string
  },
  body:object
}

type LogicalFormatKey = keyof typeof cip.epath.segment.logical.Format
type CipService = keyof typeof cip.message.Service
/**
 * Class describing an enip client
 */
export class EnipClient extends EventEmitter {
  private _tcpClient:Socket = new Socket();
  // private _udpClient:Socket=udp.createSocket('udp4');
  private _dataHandler:DataHandler;
  private _enipSession:number|null;
  private _targetIp:string;
  private _targetPort:number;

  /**
   * EnipClient instance constructor
   * @param {string} ip host to connect
   * @param {number} port listening port
   * @param {DataHandler} dataHandler custom data DataHandler
   */
  public constructor(ip:string, port:number=44818, dataHandler:DataHandler) {
    super();
    this._targetIp=ip;
    this._targetPort=port;
    this._enipSession=null;
    this._dataHandler=dataHandler;
    this.configureHandler();
  }

  /**
   * tcpIp connection
   */
  public connect() {
    this._tcpClient.connect(this._targetPort, this._targetIp);
  }

  /**
   * register a session
   */
  public registerSession():void {
    const enipHeader = enip.header.buildRegSession();
    const enipData = new enip.data.RegisterSession();
    const enipMessage = new EnipMessage(enipHeader, enipData);

    this._tcpClient.write(enipMessage.encode(), (error)=>{
      if (error) {
        this.emit('error', error);
      }
    });
  }

  /**
   * Configure the tcpclient handler
   */
  private configureHandler() {
    this._tcpClient.on('data', (dataBuffer:Buffer)=>{
      this.emit('enipData', dataBuffer);
    });
    this._tcpClient.on('connect', ()=>{
      this.emit('enipConnect');
    });
    this._tcpClient.on('end', ()=>{
      this.emit('tcpEnd');
    });
    this._tcpClient.on('error', (error:TcpError)=>{
      this.emit('enipError', error);
    });

    this.on('enipConnect', this.connectTcpEventHandler);
    this.on('enipSession', this.sessionTcpEventHandler);
    this.on('enipData', this.dataTcpEventHandler);
  }

  /**
   * handler to perform processing in reaction to socket 'data' event
   * @param {Buffer} dataBuffer data buffer
   */
  private dataTcpEventHandler(dataBuffer:Buffer) : void {
    const enipMessage = EnipMessage.parse(dataBuffer);
    const data = buildRemoteRespMsg(enipMessage);

    if (data.status.state) {
      switch (data.command) {
        case 'RegisterSession':
          this.emit('enipSession', data.session);
          break;
        case 'SendRRData':
          this.emit('SendRRData', data);
          this.removeAllListeners('SendRRData');
          break;
      }
    } else {
      this.emit('default');
    }
  }

  /**
   * handler to perform processing in reaction to socket 'connect' event
   */
  private connectTcpEventHandler() {
    this.registerSession();
  }

  /**
   * handler to perform processing in reaction to socket 'end' event
   */
  private endTcpEventHandler():void {
    this.emit('end');
  }

  /**
   * handler to perform processing in reaction to this 'session' event
   * @param {number} session communication session code
   */
  private sessionTcpEventHandler(session:number) {
    this._enipSession = session;
    this.emit('session');
  }

  /**
   * Send unconnected message
   * @param {object} enipRemoteMsg object describing a enip remote service
   * @param {function} callback handler function
   */
  public sendUnconnectedMsg(enipRemoteMsg:EnipRemoteMessage,
      callback:(error:Error|null, data?:object|undefined)=>void):void {
    if (!this._enipSession) {
      throw new Error('No session open for enip communication.');
    }

    const requestMsg = enipRemoteMsg.request;
    const responseMsg = enipRemoteMsg.response ?
        enipRemoteMsg.response :
        undefined;

    // define epath
    const epath = buildLogicalEpath(requestMsg.epath);

    // encode data
    try {
      const dataBuffer = requestMsg.data ?
          this._dataHandler.encode(requestMsg.data):
          undefined;

      const reqMessage = new cip.message.Request(
          cip.message.Service[<CipService>requestMsg.service],
          epath,
          dataBuffer,
      );

      const addressItem = enip.data.item.buildNullAddressItem();
      const dataItem = enip.data.item.buildUnconnectedDataItem(reqMessage);
      const cpf = new enip.data.CPF(addressItem, dataItem);

      const enipData = new enip.data.SendRR(cpf);
      // eslint-disable-next-line max-len
      const enipHeader = enip.header.buildSendRR(this._enipSession, enipData.length);
      const enipMessage = new EnipMessage(enipHeader, enipData);

      this.on('SendRRData', (enipMsg:EnipRemoteRespMsg)=> {
      // LOG:
        console.log('SendRRData response');
        console.log(JSON.stringify(enipMsg));

        if (enipMsg.status.state) {
        // if enip status => success
        // get the message body
          const body = <enip.data.SendRRBody>enipMsg.body;
          let data:HandledData|undefined;

          if (body.messageStatus && body.messageStatus == 'Success') {
            if (responseMsg) {
              const type = responseMsg.items ?
            responseMsg.items.type :
            responseMsg.type;

              data = body.data ?
            this._dataHandler.parse(body.data, type):
            undefined;
            } else {
              data=undefined;
            }

            callback(null, data);
          } else {
          // eslint-disable-next-line max-len
            callback(new TargetProtocolError('ERR_PROTOCOL_CIP', `ERROR: Error type <${body.messageStatus}> reply by target.`));
          }
        } else {
        // eslint-disable-next-line max-len
          callback(new TargetProtocolError('ERR_PROTOCOL_ENIP', 'ERROR: ENIP message transmission failure'));
        }
      });

      this._tcpClient.write(enipMessage.encode());
    } catch (error) {
      callback(<ProxyError>error);
    }
  }
}

/**
 * build a logical epath object
 * @param {CipEpath}epathMsg opbject describing epath
 * @return {Epath} cip Epath instance
 */
function buildLogicalEpath(epathMsg:CipEpath) : cip.EPath {
  const pathArray:cip.epath.segment.Logical[] = [];
  const classSeg = new cip.epath.segment.Logical(
      cip.epath.segment.logical.Type.CLASS_ID,
      cip.epath.segment.logical.Format[<LogicalFormatKey>epathMsg.class.type],
      epathMsg.class.value);
  pathArray.push(classSeg);

  const instanceSeg = new cip.epath.segment.Logical(
      cip.epath.segment.logical.Type.INSTANCE_ID,
      // eslint-disable-next-line max-len
      cip.epath.segment.logical.Format[<LogicalFormatKey>epathMsg.instance.type],
      epathMsg.instance.value);
  pathArray.push(instanceSeg);

  if (epathMsg.attribute) {
    const attributeSeg = new cip.epath.segment.Logical(
        cip.epath.segment.logical.Type.ATTRIBUTE_ID,
        // eslint-disable-next-line max-len
        cip.epath.segment.logical.Format[<LogicalFormatKey>epathMsg.attribute.type],
        epathMsg.attribute.value);
    pathArray.push(attributeSeg);
  }
  return new cip.EPath(pathArray);
}

/**
 * build a response message object from EnipMessage instance
 * @param {EnipMessage} enipMsg EnipMessade instance
 * @return {EnipRemoteRespMsg} object describing the response
 */
function buildRemoteRespMsg(enipMsg:EnipMessage) : EnipRemoteRespMsg {
  return {
    session: enipMsg.session,
    status: enipMsg.status,
    command: enipMsg.command,
    body: <object>enipMsg.body,
  };
}

