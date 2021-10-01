// import express to manage http request
import express, {Request, Response, Router} from 'express';
import config from 'config';
import {EnipRemoteMessage,
  RouterConfiguration} from '../custom/config_interfaces';
import {buildRouterFromConfig} from './config_router';
import filehandle from 'fs/promises';
import {EnipClient} from '../enip/enip_client';
import {FanucDataHandler} from '../custom/fanuc_data_handler';
import {ProxyError} from '../proxy_error';
import {EventEmitter} from 'events';

interface TcpError extends Error {
  errno:number,
  code:string,
  syscall:string,
  address:string,
  port:number
}

const ServerMessage:Record<number, string>= {
  0x0e: 'Server end with no error',
  0x1e: 'EnipClient Error TCP connection',
  0x2e: 'Server configuration error',
};

const enipConnTimeout = 2000;
let enipConnectAttempt = 0;
const maxEnipConnectAttempt = 5;

// instanciate a datahandler to transform data
// according to the targeted device
const dataHandler = new FanucDataHandler();

// instanciate a EventEmitter to manage server status
const serverStatusManager = new EventEmitter();
// event handler for log
serverStatusManager.on('log', (logger:string, message:string)=>{
  switch (logger) {
    case 'CONSOLE':
      console.log(message);
      break;
    case 'SERVICE':
      console.log(message);
      break;
    default:
      console.log(message);
  }
});

// event handler to log exit event
process.on('exit', (code:number)=>{
  serverStatusManager.emit('log', 'CONSOLE', ServerMessage[code]);
});

// object to store server status
const serverStatus = {
  routerBuilded: false,
  enipClientConnection: false,
  enipClientSession: false,
};

// define an enipclient to communicate with target
let enipClient:EnipClient;

// define a router to process http request
let customRouter:Router;

// instanciate the express server
const server = express();

// define generic middlewares for the server
server.use(express.json()); // parse body in json
server.use(numericParser); // convertion to number

// middleware for all requests
server.all('*', (request:Request,
    response:Response,
    next:()=>void)=>{
// define a log object
  const logObject = {
    api: request.baseUrl+request.path,
    query: request.query,
    method: request.method,
  };

  // LOG:
  console.log('Request received :');
  console.log(logObject);
  next();
});

// instanciate config parameters
let port:number;
let enipDeviceIp:string;
let enipDevicePort:number;
let apiConfigPath:string;

try {
  // get the configuration from the config module
  port = config.get('http.port');
  enipDeviceIp = <string>config.get('remoteServer.ipv4');
  enipDevicePort = <number>config.get('remoteServer.port');
  apiConfigPath = config.get('http.apiRegister');

  // init and connect the enip client
  // it raise connect and session event when it ready
  enipClient = new EnipClient(enipDeviceIp, enipDevicePort, dataHandler);
  enipConnectAttempt+=1;
  tryEnipConnection(enipConnectAttempt, enipDeviceIp, enipDevicePort);

  // build a router from configuration file;
  // serverStatusManager raise routerBuildOK event when it ready
  buildRouter(apiConfigPath);
} catch (error) {
  serverStatusManager.emit('log', 'CONSOLE', (<Error>error).message);
  process.exit(0x2e);
}

// in case of success
// define this middleware to get msg from custom router and send enip message
enipClient.on('enipConnect', ()=>{
  serverStatusManager
      .emit('log', 'CONSOLE', 'Enip client connected to target.');

  serverStatus.enipClientConnection=true;
});

enipClient.on('enipSession', (session)=>{
  serverStatus.enipClientSession=true;
  serverStatusManager
      .emit('log', 'CONSOLE', 'Enip client session open with id :'+session);

  serverStatusManager.emit('startServer');
});

enipClient.on('enipError', (error:TcpError)=>{
  if (error.syscall == 'connect' &&
      enipConnectAttempt < maxEnipConnectAttempt) {
    enipConnectAttempt+=1;
    setTimeout(tryEnipConnection.bind(null,
        enipConnectAttempt,
        error.address,
        error.port), enipConnTimeout);
  } else {
    process.exit(0x1e);
  }
});


serverStatusManager.on('startServer', ()=>{
  if (serverStatus.enipClientConnection &&
      serverStatus.enipClientSession &&
      serverStatus.routerBuilded) {
    server.listen(port, ()=>{
      serverStatusManager.emit('log', 'CONSOLE', 'server listen on port '+port);
    });
  };
});


// when the router is builded, initialise customRouter and add final middlewares
serverStatusManager.on('routerBuilded', (router:Router)=>{
  // initialise custom router
  customRouter = router;
  // add middleware to get succes process from custom router
  customRouter.use((request:Request,
      response:Response,
      next:(error:Error)=>void)=> {
    // remote message build by the customRouter
    // is stored in  response.locals.remoteMessage
    // get the remote message
    const remoteMessage = <EnipRemoteMessage>response
        .locals
        .remoteMessage;

    // send message build by config_router
    enipClient.sendUnconnectedMsg(remoteMessage,
        (error, data) => {
          if (error) {
            next(error);
          } else {
            response.status(200).send(data);
          };
        });
  });

  // add middleware to get error from custom router
  customRouter.use((error:Error,
      request:Request,
      response:Response, next:()=>void)=>{
    if (error instanceof ProxyError) {
      // if proxy error, get JSON representation and send it to the client
      const proxyError = <ProxyError>error;
      const errorDesc = proxyError.toJSON();

      response.status(proxyError.httpCode).send(errorDesc);
    } else {
      // if not a ProxyError, raise it
      throw error;
    }
  });

  // add customRouter in the server
  server.use('/', customRouter);

  serverStatusManager.emit('log',
      'CONSOLE',
      'Router ready to process HTTP request');

  serverStatus.routerBuilded=true;
  serverStatusManager.emit('startServer');
});

/**
 * try to connect enip client to target
 * @param {number} connectionAttempt attempt number
 * @param {string} enipDeviceIp target ip address
 * @param {number} enipDevicePort target listening port
 */
function tryEnipConnection(connectionAttempt:number,
    enipDeviceIp:string,
    enipDevicePort:number) {
  // eslint-disable-next-line max-len
  serverStatusManager.emit('log', 'CONSOLE', `Try enip connection to target ${enipDeviceIp}:${enipDevicePort}. Attempt: ${connectionAttempt}.`);
  enipClient.connect();
}

/**
 * build router from a configuration file
 * @param {string} configFilePath configuration file path
 */
function buildRouter(configFilePath:string): void {
  loadConfig(configFilePath)
      .then((routerConfig:RouterConfiguration)=>{
        const customRouter = buildRouterFromConfig(routerConfig);
        serverStatusManager.emit('routerBuilded', customRouter);
      }).catch((error:Error)=>{
        serverStatusManager.emit('error', error);
      });
}

/**
 * read and parse the configuration file
 * @param {string} configFile configuration file path
 * @return {Promise} a promise for configuration reading
 */
function loadConfig(configFile:string) :Promise<RouterConfiguration> {
  return new Promise((resolve, reject) => {
    filehandle.readFile(configFile)
        .then((strBuffer)=>{
          try {
            const config = JSON.parse(strBuffer.toString());
            resolve(config);
          } catch (error) {
            reject(error);
          }
        }).catch((error)=> {
          // eslint-disable-next-line no-throw-literal
          reject(error);
        });
  });
}

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
