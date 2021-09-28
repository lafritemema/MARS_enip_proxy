import express, {Request, Response} from 'express';
import {EnipRemoteMessage,
  RouterConfiguration} from '../custom/config_interfaces';
import {buildRouterFromConfig} from './config_router';
import filehandle from 'fs/promises';
import {EnipClient} from '../enip/enip_client';
import {FanucDataHandler} from '../custom/fanuc_data_handler';
import {ProxyError} from '../proxy_error';

// import regRouter from './router/reg_router';

const configFile = './resources/fanuc_remote_reg.json';
const dataHandler = new FanucDataHandler();
const enipClient = new EnipClient('127.0.0.2', 44818, dataHandler);

const port = 8000;
const app = express();
app.use(express.json()); // parse body in json
app.use(numericParser); // convertion to number

app.all('*', (request:Request,
    response:Response,
    next:()=>void)=>{
  const logObject = {
    api: request.baseUrl+request.path,
    query: request.query,
    method: request.method,
  };

  console.log('Request received :');
  console.log(logObject);

  next();
});

enipClient.addListener('connect', ()=>{
  console.log('enip proxy connected to server');
});

enipClient.addListener('RegisterSession', (session)=>{
  app.listen(port, ()=>{
    console.log('http server listening on port '+ port);
  });
});

loadConfig(configFile)
    .then((configObj)=> {
      const customRouter = buildRouterFromConfig(configObj);

      // middleware launched if no error raised by custom router
      // it use enip client to send message to the target
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
            (error, data)=> {
              if (error) {
                next(error);
              } else {
                response.status(200).send(data);
              };
            });
      });

      // if custom router raise an error
      // launch this middleware to send error
      customRouter.use((error:Error,
          request:Request,
          response:Response, next:()=>void)=>{
        if (error instanceof ProxyError) {
          const proxyError = <ProxyError>error;
          const errorDesc = proxyError.toJSON();
          response.status(proxyError.httpCode).send(errorDesc);
        } else {
          throw error;
        }
      });

      app.use('/', customRouter);
    })
    .catch((error)=> {
      console.log(error);
    });

/**
 * read and parse the configuration file
 * @param {string} configFile configuration file path
 * @return {Promise} a promise for configuration reading
 */
function loadConfig(configFile:string) :Promise<RouterConfiguration> {
  return new Promise((resolve, reject) => {
    filehandle.readFile(configFile)
        .then((strBuffer)=>{
          const config = JSON.parse(strBuffer.toString());
          resolve(config);
        }).catch((error)=> {
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
