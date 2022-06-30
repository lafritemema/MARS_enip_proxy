
// import * as udp from 'dgram';
import {EventEmitter} from 'events';
import * as cip from 'cip';
import EnipMessage, * as enip from 'enip';
import {DataHandler, HandledData} from './data_handler';
import {EnipRemoteMessage,
  CipEpath,
  EnipRemoteMessageReq,
  EnipRemoteMessageRes} from '../custom/config_interfaces'; // interface for config
import {ProxyError, TargetProtocolError} from '../proxy_error';
import NodeCache from 'node-cache';
import {TcpClient} from './tcp_client';
import Logger from '@common/logger';
import {ServerException, ServerExceptionType} from 'src/lib/server/exceptions';

interface TcpError extends Error {
  errno:number,
  code:string,
  syscall:string,
  address:string,
  port:number
}

interface CachePacket {
  responseType?: string|undefined,
  usageType: 'standard'|'tracker',
  timer:string;
}

export interface EnipDataPacket {
  command: string,
  session: number,
  data: HandledData}

const MAX_CONNECT_ATTEMPT = 3;
const CONNECT_TIMEOUT = 2000;

type LogicalFormatKey = keyof typeof cip.epath.segment.logical.Format
type CipService = keyof typeof cip.message.Service
/**
 * Class describing an enip client
 */
export class EnipClient extends EventEmitter {
  private _tcpClient:TcpClient = new TcpClient();
  // private _udpClient:Socket=udp.createSocket('udp4');
  private _dataHandler:DataHandler;
  private _enipSession:number|null;
  private _targetIp:string;
  private _targetPort:number;
  private _cache:NodeCache = new NodeCache();
  private _connectAttempt:number;
  private _logger:Logger;
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
    this._connectAttempt = 0;
    this._logger = new Logger('ENIPCLIENT');
    this.configureHandler();
  }

  /**
   * function to create connection and open session between
   * enip client and enip device
   * @return {Promise<number>} the session id
   */
  public run():Promise<number> {
    return new Promise((resolve, reject)=>{
      this.on('session', (data:EnipDataPacket)=>{
        this._logger.success(`open session with device ${this._targetIp}`);
        this._enipSession = data.session;
        resolve(data.session);
      });
      this.on('error', (error:ServerException)=> {
        reject(error);
      });
      this.connect();
    });
  }

  /**
   * tcpIp connection
   */
  public connect() {
    this._connectAttempt +=1;
    // eslint-disable-next-line max-len
    this._logger.try(`connection to enip devices ${this._targetIp}`);
    this._tcpClient.connect(this._targetPort, this._targetIp);
  }

  /**
   * register a session
   */
  private registerSession():void {
    const enipHeader = enip.header.buildRegSession();
    const enipData = new enip.data.RegisterSession();
    const enipMessage = new EnipMessage(enipHeader, enipData);
    this._cache.set('session', {
      usageType: 'standard',
    });
    this._tcpClient.send(enipMessage.encode(), 'session');
  }

  /**
   * Configure the tcpclient handler
   */
  private configureHandler() {
    // handler for TcpClient tcpdata event
    this._tcpClient.on('tcpdata', (tcpData:Buffer, requestId:string)=>{
      const cpacket = <CachePacket> this._cache.get(requestId);
      const enipMsg = EnipMessage.parse(tcpData);
      let data:HandledData|undefined;

      // if enipMessage status state (enip header status) = true => success
      if (enipMsg.isSuccess) {
        // if there is a body in EnipMessage => cip message
        if (enipMsg.hasBody) {
          switch (enipMsg.command) {
            case 'SendRRData':
              const enipbody = <enip.data.SendRRBody> enipMsg.body;
              console.log(enipbody.data);
              data = enipbody.data ?
                this._dataHandler.parse(enipbody.data, cpacket.responseType):
                undefined;
              break;
            case 'ListIdentity':
              data = <enip.data.ListIdentityBody>enipMsg.body;
              break;
          }
        }
        this.emit(requestId,
            {command: enipMsg.command,
              session: enipMsg.session,
              data: data});
      } else {
        // default on enip request
        // eslint-disable-next-line max-len
        this.emit('failure', new TargetProtocolError('ERR_PROTOCOL_ENIP', 'ERROR: ENIP message transmission failure'));
      }
      if (cpacket.usageType == 'standard') {
        this._cache.del(requestId);
      }
    });

    // handler for socket connect event
    this._tcpClient.on('connect', ()=>{
      this._logger.success(`connection to enip devices ${this._targetIp}`);
      this._logger.try(`open session with device ${this._targetIp}`);
      this.registerSession();
    });
    // handler for socket end event
    this._tcpClient.on('end', ()=>{
      this.emit('end');
    });
    // handler for error socket event
    this._tcpClient.on('error', (error:TcpError)=>{
      // handle tcp error
      // if connect error
      switch (error.syscall) {
        case 'connect':
          if (this._connectAttempt < MAX_CONNECT_ATTEMPT) {
            // try to reconnect if no max connect attempt reached
            // eslint-disable-next-line max-len
            this._logger.failure(`connection to enip devices ${this._targetIp}(${this._connectAttempt}/${MAX_CONNECT_ATTEMPT})`);
            setTimeout(this.connect.bind(this), CONNECT_TIMEOUT);
          } else {
            // eslint-disable-next-line max-len
            this._logger.failure(`connection to enip devices ${this._targetIp}(${this._connectAttempt}/${MAX_CONNECT_ATTEMPT})`);
            const serror = new ServerException(['SERVER', 'ENIP',
              'TCP', 'CONNECT'],
            ServerExceptionType.CONNECTION_ERROR,
            error.message,
            500);

            this.emit('error', serror);
          }
          break;
        default:
          console.log(error);
          const serror = new ServerException(['SERVER', 'ENIP',
            'TCP', 'CONNECT'],
          ServerExceptionType.CONNECTION_ERROR,
          error.message,
          500);
          this.emit('error', serror);
      }
    });
  }

  /**
 * Build an UnConnected EnipMessage
 * @param {EnipRemoteMessageReq} requestMsg object describing the request to send
 * @return {EnipMessage} an EnipMessage instance
 */
  private buildUCEnipMessage(requestMsg:EnipRemoteMessageReq):EnipMessage {
    // define epath
    const epath = buildLogicalEpath(requestMsg.epath);

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
    const enipHeader = enip.header.buildSendRR(
        <number> this._enipSession,
        enipData.length);

    const enipMessage = new EnipMessage(enipHeader, enipData);

    return enipMessage;
  }

  /**
   * send enip unconnected message
   * @param {string} requestId id of unconnected request
   * @param {EnipRemoteMessage} enipRemoteMsg object describing the message to send
   */
  public sendUnconnectedMsg(requestId:string,
      enipRemoteMsg:EnipRemoteMessage) : void {
    if (!this._enipSession) {
      // eslint-disable-next-line max-len
      this.emit('failure', new Error('No session open for enip communication.'));
    } else {
      const requestMsg = enipRemoteMsg.request;
      const responseMsg = enipRemoteMsg.response ?
            enipRemoteMsg.response :
            undefined;

      let responseType:string|undefined;
      if (responseMsg) {
        responseType = responseMsg.items ?
        responseMsg.items.type :
        responseMsg.type;
      } else {
        responseType = undefined;
      }
      try {
        // build the enip message
        const enipMessage = this.buildUCEnipMessage(requestMsg);

        // store <requestId> : <responseType> in cache
        this._cache.set(requestId,
            {responseType: responseType,
              usageType: 'standard'});

        // send message using TcpClient instance
        this._tcpClient.send(enipMessage.encode(), requestId);
      } catch (error) {
        this.emit('failure', <ProxyError>error);
      }
    }
  }

  /**
   * initialize a tracker for a remote service
   * @param {string} requestId tracker request id
   * @param {EnipRemoteMessage} enipRemoteMsg object describing the message to send
   * @param {number} trackInterval time interval between each tracking request
   */
  public initTracker(requestId:string, enipRemoteMsg:EnipRemoteMessage,
      trackInterval: number) {
    // TODO implement new tcp write on inittracker

    if (!this._enipSession) {
      // eslint-disable-next-line max-len
      this.emit('failure', new Error('No session open for enip communication.'));
    } else {
      const requestMsg = enipRemoteMsg.request;
      const responseMsg = <EnipRemoteMessageRes>enipRemoteMsg.response;

      const responseType = responseMsg.items ?
                           responseMsg.items.type :
                           responseMsg.type;
      try {
        const enipMessage = this.buildUCEnipMessage(requestMsg);

        this._cache.set(requestId, {
          responseType: responseType,
          usageType: 'tracker',
          timer: 'running'});

        const timer = setInterval(
            (self:EnipClient, enipBuffer:Buffer)=>{
              switch ((<CachePacket>self._cache.get(requestId)).timer) {
                case 'running':
                  self._tcpClient.send(enipBuffer, requestId);
                  break;
                case 'clear':
                  clearInterval(timer);
                  this._cache.del(requestId);
                  break;
              }
            },
            trackInterval,
            this,
            enipMessage.encode(),
        );
        timer.unref();


        timer.ref();
      } catch (error) {
        this.emit('failure', error);
      }
    }
  }

  /**
   * clear a tracker
   * @param {string} requestId tracker request id
   */
  public clearTracker(requestId:string) {
    // change the cache packet timer status
    this._cache.set(requestId, {timer: 'clear'});
    this.removeAllListeners(requestId);
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


