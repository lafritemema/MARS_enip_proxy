
import {Socket} from 'net';
// import * as udp from 'dgram';
import {EventEmitter} from 'events';
import * as cip from 'cip';
import EnipMessage, * as enip from 'enip';
import {DataHandler, HandledData} from './data_handler';
import {EnipRemoteMessage,
  CipEpath} from '../custom/config_interfaces'; // interface for config
import {ProxyError, TargetProtocolError} from '../proxy_error';


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

  /**
   * EnipClient instance constructor
   * @param {string} ip host to connect
   * @param {number} port listening port
   * @param {DataHandler} dataHandler custom data DataHandler
   */
  public constructor(ip:string, port:number=44818, dataHandler:DataHandler) {
    super();
    this._enipSession=null;
    this._dataHandler=dataHandler;

    this._tcpClient.addListener('data', (dataBuffer)=> {
      const enipMessage = EnipMessage.parse(dataBuffer);
      const data = buildRemoteRespMsg(enipMessage);

      if (data.status.state) {
        switch (data.command) {
          case 'RegisterSession':
            this.emit('RegisterSession', data.session);
            break;
          case 'SendRRData':
            this.emit('SendRRData', data);
            this.removeAllListeners('SendRRData');
            break;
        }
      } else {
        this.emit('error');
      }
    });

    this.on('RegisterSession', (session)=>{
      this._enipSession = session;
    });

    this._tcpClient.connect(port, ip, ()=> {
      this.emit('connect');
      this.registerSession();
    });
  }

  /**
   * Send unconnected message
   * @param {object} enipRemoteMsg object describing a enip remote service
   * @param {Buffer} data buffer describing the data to send
   */
  public sendUnconnectedMsg(enipRemoteMsg:EnipRemoteMessage,
      callback:(error:Error|null, data?:object|undefined)=>void):void {
    if (!this._enipSession) {
      throw new Error('No session open for enip communication.');
    }

    console.log(JSON.stringify(enipRemoteMsg));

    const requestMsg = enipRemoteMsg.request;
    const responseMsg = enipRemoteMsg.response ?
        enipRemoteMsg.response :
        undefined;

    // define epath
    const epath = buildLogicalEpath(requestMsg.epath);
    // LOG
    console.log(epath.toJSON());

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

  /**
   *
   */
  private registerSession():void {
    const enipHeader = enip.header.buildRegSession();
    const enipData = new enip.data.RegisterSession();
    const enipMessage = new EnipMessage(enipHeader, enipData);

    this._tcpClient.write(enipMessage.encode(), function(error) {
      if (error) {
        throw error;
      }
    });
  }
  // await this._tcpClient.listener
}

/**
 * build a logical epath object
 * @param {EnipObject} enipNode describing the targeted element
 * @return {Epath} enip epath object
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
 *
 * @param enipMsg
 * @returns
 */
function buildRemoteRespMsg(enipMsg:EnipMessage) : EnipRemoteRespMsg {
  return {
    session: enipMsg.session,
    status: enipMsg.status,
    command: enipMsg.command,
    body: <object>enipMsg.body,
  };
}


/*
this._tcpClient.addListener('data', (dataBuffer)=> {
      console.log('data received');
      const enipMessage = EnipMessage.parse(dataBuffer);
      const data = buildRemoteRespMsg(enipMessage);
      console.log(data);

      if (data.status.state && data.command == 'RegisterSession') {
        console.log('emit session open');
        this._enipSession = data.session;
        this.emit('session', this._enipSession.toString(16));
      } else {
        this.emit('data', data);
      }
    });

    */
