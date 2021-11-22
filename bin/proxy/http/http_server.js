"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import express to manage http request
const express_1 = __importDefault(require("express"));
const config_1 = __importDefault(require("config"));
const config_router_1 = require("./config_router");
const promises_1 = __importDefault(require("fs/promises"));
const enip_client_1 = require("../enip/enip_client");
const fanuc_data_handler_1 = require("../custom/fanuc_data_handler");
const proxy_error_1 = require("../proxy_error");
const events_1 = require("events");
const crypto_1 = require("crypto");
const amqp = __importStar(require("amqplib"));
const ServerMessage = {
    0x0e: 'Server end with no error',
    0x1e: 'EnipClient Error TCP connection',
    0x2e: 'Server configuration error',
};
const enipConnTimeout = 2000;
let enipConnectAttempt = 0;
const maxEnipConnectAttempt = 5;
// object to store server status
const serverStatus = {
    routerBuilded: false,
    enipClientConnection: false,
    enipClientSession: false,
    rabbitMQConfiguration: false,
};
// instanciate a EventEmitter to manage server status
const serverStatusManager = new events_1.EventEmitter();
// init rabbit mq message exchange
const topics = {
    alert: 'proxy.alert',
};
// instanciate a datahandler to transform data
// according to the targeted device
const dataHandler = new fanuc_data_handler_1.FanucDataHandler();
// event handler for log
serverStatusManager.on('log', (logger, message) => {
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
process.on('exit', (code) => {
    serverStatusManager.emit('log', 'CONSOLE', ServerMessage[code]);
});
// define an enipclient to communicate with target
let enipClient;
// define a router to process http request
let customRouter;
// instanciate the express server
const server = express_1.default();
// define generic middlewares for the server
server.use(express_1.default.json()); // parse body in json
server.use(numericParser); // convertion to number
// middleware for all requests
server.all('*', (request, response, next) => {
    // define a log object
    const logObject = {
        api: request.baseUrl + request.path,
        query: request.query,
        method: request.method,
        body: request.body,
    };
    // LOG:
    console.log('Request received :');
    console.log(logObject);
    next();
});
// instanciate config parameters
let port;
let enipDeviceIp;
let enipDevicePort;
let apiConfigPath;
let rabbitMqUrl;
let exchange;
try {
    // get the configuration from the config module
    port = config_1.default.get('httpServer.port');
    enipDeviceIp = config_1.default.get('remoteServer.ipv4');
    enipDevicePort = config_1.default.get('remoteServer.port');
    apiConfigPath = config_1.default.get('httpServer.apiRegister');
    rabbitMqUrl = config_1.default.get('rabbitMq.url');
    exchange = config_1.default.get('rabbitMq.exchange');
    // init and connect the enip client
    // it raise connect and session event when it ready
    enipClient = new enip_client_1.EnipClient(enipDeviceIp, enipDevicePort, dataHandler);
    enipConnectAttempt += 1;
    tryEnipConnection(enipConnectAttempt, enipDeviceIp, enipDevicePort);
    // build a router from configuration file;
    // serverStatusManager raise routerBuildOK event when it ready
    buildRouter(apiConfigPath);
}
catch (error) {
    serverStatusManager.emit('log', 'CONSOLE', error.message);
    process.exit(0x2e);
}
const stream = amqp.connect(rabbitMqUrl);
stream
    .then((connection) => {
    return connection.createChannel();
})
    .then((channel) => {
    channel.assertExchange(exchange, 'topic', {
        durable: false,
    });
    serverStatusManager.on(topics.alert, (msg) => {
        const alertMsg = {
            status: 'SUCCESS',
        };
        const alertMsgBuffer = Buffer.from(JSON.stringify(alertMsg));
        channel.publish(exchange, topics.alert, alertMsgBuffer);
    });
    serverStatus.rabbitMQConfiguration = true;
    serverStatusManager.emit('startServer');
});
// in case of success
// define this middleware to get msg from custom router and send enip message
enipClient.on('connect', () => {
    serverStatusManager
        .emit('log', 'CONSOLE', 'Enip client connected to target.');
    serverStatus.enipClientConnection = true;
});
enipClient.on('session', (enipdata) => {
    serverStatus.enipClientSession = true;
    serverStatusManager
        // eslint-disable-next-line max-len
        .emit('log', 'CONSOLE', 'Enip client session open with id :' + enipdata.session);
    serverStatusManager.emit('startServer');
});
enipClient.on('error', (error) => {
    if (error.syscall == 'connect' &&
        enipConnectAttempt < maxEnipConnectAttempt) {
        enipConnectAttempt += 1;
        setTimeout(tryEnipConnection.bind(null, enipConnectAttempt, error.address, error.port), enipConnTimeout);
    }
    else {
        process.exit(0x1e);
    }
});
serverStatusManager.on('startServer', () => {
    if (serverStatus.enipClientConnection &&
        serverStatus.enipClientSession &&
        serverStatus.routerBuilded &&
        serverStatus.rabbitMQConfiguration) {
        server.listen(port, () => {
            serverStatusManager.emit('log', 'CONSOLE', 'server listen on port ' + port);
        });
    }
    ;
});
// when the router is builded, initialise customRouter and add final middlewares
serverStatusManager.on('routerBuilded', (router) => {
    // initialise custom router
    customRouter = router;
    // add middleware to get succes process from custom router
    customRouter.use((request, response, next) => {
        // remote message build by the customRouter
        // is stored in  response.locals.remoteMessage
        // get the remote message
        const remoteMessage = response
            .locals
            .remoteMessage;
        const requestId = crypto_1.randomBytes(2).toString('hex');
        switch (request.method) {
            case 'GET':
                enipClient.once(requestId, (data) => {
                    response.status(200).send({ status: 'SUCCESS', data: data });
                });
                enipClient.sendUnconnectedMsg(requestId, remoteMessage);
                break;
            case 'PUT':
                enipClient.once(requestId, (data) => {
                    response.status(200).send({ status: 'SUCCESS' });
                });
                enipClient.sendUnconnectedMsg(requestId, remoteMessage);
                break;
            case 'SUBSCRIBE':
                const setting = request.body.setting;
                const trackerSettings = setting.settings;
                enipClient.once(requestId, (data) => {
                    const treqid = crypto_1.randomBytes(2).toString('hex');
                    enipClient.on(treqid, (enipPacket) => {
                        switch (trackerSettings.tracker) {
                            case 'alert':
                                if (isEqual(trackerSettings.value, enipPacket.data)) {
                                    serverStatusManager.emit(topics.alert, {
                                        type: 'TRACKER',
                                        status: 'SUCCESS',
                                    });
                                    enipClient.clearTracker(treqid);
                                }
                                break;
                            case 'report':
                                console.log(enipPacket);
                                break;
                        }
                    });
                    enipClient.initTracker(treqid, remoteMessage, trackerSettings.interval);
                    response.status(200).send({ status: 'SUCCESS' });
                });
                enipClient.sendUnconnectedMsg(requestId, remoteMessage);
                break;
        }
    });
    // add middleware to get error from custom router
    customRouter.use((error, request, response, next) => {
        if (error instanceof proxy_error_1.ProxyError) {
            // if proxy error, get JSON representation and send it to the client
            const proxyError = error;
            const errorDesc = proxyError.toJSON();
            console.log('Error on request :' + JSON.stringify(errorDesc));
            response.status(proxyError.httpCode)
                .send({ status: 'ERROR', error: errorDesc });
        }
        else {
            // if not a ProxyError, raise it
            throw error;
        }
    });
    // add customRouter in the server
    server.use('/', customRouter);
    serverStatusManager.emit('log', 'CONSOLE', 'Router ready to process HTTP request');
    serverStatus.routerBuilded = true;
    serverStatusManager.emit('startServer');
});
/**
 * try to connect enip client to target
 * @param {number} connectionAttempt attempt number
 * @param {string} enipDeviceIp target ip address
 * @param {number} enipDevicePort target listening port
 */
function tryEnipConnection(connectionAttempt, enipDeviceIp, enipDevicePort) {
    // eslint-disable-next-line max-len
    serverStatusManager.emit('log', 'CONSOLE', `Try enip connection to target ${enipDeviceIp}:${enipDevicePort}. Attempt: ${connectionAttempt}.`);
    enipClient.connect();
}
/**
 * build router from a configuration file
 * @param {string} configFilePath configuration file path
 */
function buildRouter(configFilePath) {
    loadConfig(configFilePath)
        .then((routerConfig) => {
        const customRouter = config_router_1.buildRouterFromConfig(routerConfig);
        serverStatusManager.emit('routerBuilded', customRouter);
    }).catch((error) => {
        serverStatusManager.emit('error', error);
    });
}
/**
 * read and parse the configuration file
 * @param {string} configFile configuration file path
 * @return {Promise} a promise for configuration reading
 */
function loadConfig(configFile) {
    return new Promise((resolve, reject) => {
        promises_1.default.readFile(configFile)
            .then((strBuffer) => {
            try {
                const config = JSON.parse(strBuffer.toString());
                resolve(config);
            }
            catch (error) {
                reject(error);
            }
        }).catch((error) => {
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
function numericParser(request, response, next) {
    for (const p of Object.keys(request.query)) {
        if ((+request.query[p])) {
            // @ts-ignore
            request.query[p] = (+request.query[p]);
        }
    }
    next();
}
/**
 * Check if two javascript objects are equals
 * @param {object} obj1 first object to compare
 * @param {object} obj2 second object to compare
 * @return {Boolean} true if object are equal else false
 */
function isEqual(obj1, obj2) {
    return JSON.stringify(obj1) == JSON.stringify(obj2);
}
