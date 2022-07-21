import {getConfigFromJson, getConfigFromYaml} from '@common/utils';
import Logger from '@common/logger';
import {FanucDataHandler} from './proxy/custom/fanuc_data_handler';
import {EnipClient} from './proxy/enip/enip_client';
import {APIRegister, ProxyServerConfiguration} from './proxy/interfaces';
import {BaseException, BaseExceptionType} from '@common/exceptions';
import {AMQPServer} from './server';
import express, {Request, Response} from 'express';
import {buildRouterFromConfig} from './proxy/http/config_router';
import {AlertTrackerSettings, EnipRemoteMessage,
  RequestSetting,
  TrackerSettings} from './proxy/custom/config_interfaces';
import {ProxyError} from './proxy/proxy_error';
import {ConsumerPacket, MessageBody, MessageHeaders, MessageQuery} from './server/interfaces';

let enipClient:EnipClient;
let amqpServer:AMQPServer;
const dataHandler = new FanucDataHandler();
const LOGGER = new Logger('ENIPPROXY');
const SERVER_CONFIG = './config/server.yaml';
const FANUC_API_REG = './resources/fanuc_api_reg.json';

const RELATION = {
  'eq': isEqual,
  'neq': isNotEqual,
};

getConfigFromYaml<ProxyServerConfiguration>(SERVER_CONFIG)
    .then(async (proxyConfig:ProxyServerConfiguration)=>{
      // configure enip client
      if (proxyConfig.enip && proxyConfig.enip.activate) {
        // get parameter from config
        const {host, port} = proxyConfig.enip;
        // initialize enipClient
        enipClient = new EnipClient(host, port, dataHandler);

        const sessionid = await enipClient.run();
        LOGGER.info(`communication with session id ${sessionid} open with enip device`);
        return proxyConfig;
      } else {
        throw new BaseException(['CONFIG'],
            BaseExceptionType.CONFIG_MISSING,
            `no configuration for enip client in config file ${SERVER_CONFIG}`);
      }
    }).then(async (proxyConfig:ProxyServerConfiguration)=>{
      if (proxyConfig.http && proxyConfig.http.activate) {
        const httpConfig = proxyConfig.http;
        // instanciate the express server
        const server = express();

        // define generic middlewares for the server
        server.use(express.json()); // parse body in json
        server.use(numericParser); // convertion to number

        // middleware for all requests
        server.all('*', allRequestMW);

        const serverConfig = await getConfigFromJson<APIRegister>(FANUC_API_REG);
        const customRouter = buildRouterFromConfig(serverConfig);
        customRouter.use(processServerReqMW);
        customRouter.use(handleRouterErrorMW);

        server.use('/', customRouter);
        console.log(server.routes);
        server.listen(httpConfig.port, ()=>{
          LOGGER.info('http server ready to handle messages');
        });
        return proxyConfig;
      } else {
        return proxyConfig;
      }
    }).then((proxyConfig:ProxyServerConfiguration)=> {
      if (proxyConfig.amqp && proxyConfig.amqp.activate) {
        const amqpConfig = proxyConfig.amqp;
        amqpServer = new AMQPServer('sequencer',
            amqpConfig.host,
            amqpConfig.port,
            amqpConfig.exchange);
        amqpServer.run();
      }
    }).catch((error:BaseException)=>{
      LOGGER.info(JSON.stringify(error.describe()));
      process.exit(1);
    });


/**
 * express middleware to parse string values in numeric
 * @param {Request} request http request
 * @param {Response} response http response
 * @param {function} next next middleware
 */
function numericParser(request:Request,
    response:Response,
    next:()=>void) {
  for (const p of Object.keys(request.query)) {
    if ((+<string>request.query[p])) {
      // @ts-ignore
      request.query[p] = (+<string>request.query[p]);
    }
  }
  next();
}

/**
 * express middleware to perform for each requests
 * @param {Request} request http request
 * @param {Response} response http response
 * @param {function} next next middleware
 */
function allRequestMW(request:Request, response:Response,
    next:()=>void) {
// define a log object
  const logObject = {
    path: request.baseUrl+request.path,
    query: request.query,
    method: request.method,
    body: request.body,
  };

  const uid = request.headers.uid;

  // LOG:
  LOGGER.info(`Request received with id ${uid}`);
  LOGGER.debug(JSON.stringify(logObject));
  next();
}


/**
 * middleware function to process server request from client
 * @param {Request} request http request
 * @param {Response} response http response
 * @param {function} next next middleware
 */
function processServerReqMW(request:Request, response:Response,
    next:(error:Error)=>void) {
  // TODO to analyse
  // remote message build by the customRouter
  // is stored in  response.locals.remoteMessage
  // get the remote message
  const remoteMessage = <EnipRemoteMessage>response
      .locals
      .remoteMessage;

  // const requestId = randomBytes(2).toString('hex');
  // get request id from header
  const requestId = <string> request.headers['uid'];

  switch (request.method) {
    case 'GET':
      enipClient.once(requestId, (data)=>{
        response
            .status(200)
            .header({uid: requestId})
            .send({status: 'SUCCESS', data: data});
      });
      LOGGER.info('GET informations from device');
      enipClient.sendUnconnectedMsg(requestId, remoteMessage);
      break;
    case 'PUT':
      enipClient.once(requestId, (data)=>{
        response.status(200)
            .header({uid: requestId})
            .send({status: 'SUCCESS'});
      });
      LOGGER.info('SET informations in device');
      enipClient.sendUnconnectedMsg(requestId, remoteMessage);
      break;
    case 'SUBSCRIBE':
      const setting = <RequestSetting>request.body.setting;
      const trackerSettings = <TrackerSettings>setting.settings;

      // handler to get the tracker init return
      enipClient.once(requestId, (data)=>{
        // handler to get the traker informations
        enipClient.on(trackerSettings.uid, (enipPacket)=>{
          switch (trackerSettings.tracker) {
            case 'alert':
              // if alert type tracker
              // control the expected para
              const expected = (<AlertTrackerSettings>trackerSettings).expected;
              // get relation from expected
              const fct = RELATION[expected.relation];
              // get the wanted value from expected
              const data = expected.data;
              if (fct(<object>data, enipPacket.data)) {
                // if value conform to expected

                const cPacket = buildCPacketFromTracker(
                    trackerSettings.uid,
                    {status: 'SUCCESS'});

                amqpServer.publish(cPacket);
                enipClient.clearTracker(trackerSettings.uid);
              }
              break;
            case 'report':
              console.log(enipPacket);
              break;
          }
        });

        LOGGER.info('INIT a tracker with id trackerSettings.uid');
        // init the tracker with the tracker uid
        enipClient.initTracker(trackerSettings.uid,
            remoteMessage,
            trackerSettings.interval);

        // send a response to confirm the good traker init
        response
            .status(200)
            .header({uid: requestId})
            .send({status: 'SUCCESS'});
      });
      enipClient.sendUnconnectedMsg(requestId, remoteMessage);
      break;
  }
}

/**
 * Check if two javascript objects are equals
 * @param {object} obj1 first object to compare
 * @param {object} obj2 second object to compare
 * @return {Boolean} true if object are equal else false
 */
function isEqual(obj1:object, obj2:object) {
  const isequal = JSON.stringify(obj1) == JSON.stringify(obj2);
  LOGGER.debug(`check : ${JSON.stringify(obj1)} EQUAL ${JSON.stringify(obj2)} => ${isequal}`);
  return isequal;
}

/**
 * build a consumer packet from tracker informations
 * @param {string} trakerId : the tracker id
 * @param {object} body : the tracker body
 * @return {ConsumerPacket} the consumer packet
 */
function buildCPacketFromTracker(trakerId:string, body:object):ConsumerPacket {
  const _body = <MessageBody>body;
  const _query = <MessageQuery>{
    type: 'amqp',
    topic: 'report.sequencer.proxy',
  };
  const _headers = <MessageHeaders>{
    uid: trakerId,
  };
  return <ConsumerPacket>{
    headers: _headers,
    query: _query,
    body: _body,
  };
}

/**
 * Check if two javascript objects are not equals
 * @param {object} obj1 first object to compare
 * @param {object} obj2 second object to compare
 * @return {Boolean} true if object are equal else false
 */
function isNotEqual(obj1:object, obj2:object) {
  const isnotequal = JSON.stringify(obj1) != JSON.stringify(obj2);
  // eslint-disable-next-line max-len
  LOGGER.debug(`check : ${JSON.stringify(obj1)} NOT EQUAL ${JSON.stringify(obj2)} => ${isnotequal}`);
  return isnotequal;
}

/**
 * middleware function to handle error from router
 * @param {Error} error
 * @param {Request} request http request
 * @param {Response} response http response
 * @param {function} next next middleware
 */
function handleRouterErrorMW(error:Error,
    request:Request,
    response:Response, next:()=>void) {
  if (error instanceof ProxyError) {
    // if proxy error, get JSON representation and send it to the client
    const proxyError = <ProxyError>error;
    const errorDesc = proxyError.toJSON();
    console.log('Error on request :' + JSON.stringify(errorDesc));
    response.status(proxyError.httpCode)
        .send({status: 'ERROR', error: errorDesc});
  } else {
    // if not a ProxyError, raise it
    throw new Error();
  }
}

