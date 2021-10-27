"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRouterFromConfig = void 0;
const express_1 = __importDefault(require("express"));
const ajv_1 = __importDefault(require("ajv"));
const json_templates_1 = __importDefault(require("json-templates"));
const proxy_error_1 = require("../proxy_error");
/**
   * buid a router according to the standard configuration
   * @param {RouterConfiguration} routerConfig json configuration file
   * @return {Router} express router
   */
function buildRouterFromConfig(routerConfig) {
    // express router instance
    // eslint-disable-next-line new-cap
    const router = express_1.default.Router();
    // Ajv instance for validation
    const validator = new ajv_1.default();
    // get the configuration
    const httpApi = routerConfig.httpAPI.baseUrls;
    const remoteServices = routerConfig.remoteServices;
    const validationSchemas = routerConfig.validationSchemas.schemas;
    const transformations = routerConfig.transformations;
    // inject all shemas from configuration to validator
    for (const vs of Object.keys(validationSchemas)) {
        validator.addSchema(validationSchemas[vs].schema);
    }
    // build the routes from api configuration
    for (const url of Object.keys(httpApi)) {
        for (const path of Object.keys(httpApi[url].paths)) {
            // build a path router with buildPathRouter function
            const pathRouter = buildPathRouter(path, httpApi[url].paths[path], validator, remoteServices, transformations);
            // add it to global router for the api url
            router.use(url, pathRouter);
        }
    }
    // add a middleware to handle bad url request
    router.use((request, response, next) => {
        // if no remoteMsg key on request locals => bad url
        if (!response.locals.remoteMessage) {
            next(new proxy_error_1.RequestUrlError(request.baseUrl + request.path));
        }
        next();
    });
    return router;
}
exports.buildRouterFromConfig = buildRouterFromConfig;
/**
 * Build an express router for a path
 * with validation and processing middleware
 * @param {string} pathUrl router path url
 * @param {APIPath} paths object containing informations to build route
 * @param {Avj} validator jsonschema validation object
 * @param {RemoteServices} remoteServices object describing the target
 * remote service associated to the route method
 * @param {Transformations} transformations object describing additionnal middleware functions to process
 * @return {Router} the express router for path
 */
function buildPathRouter(pathUrl, paths, validator, remoteServices, transformations) {
    var _a, _b;
    // instanciate the path router and define a route
    // eslint-disable-next-line new-cap
    const router = express_1.default.Router();
    const route = router.route(pathUrl);
    // create middlewares for each method in the path configuration
    const methods = paths.methods;
    for (const m of Object.keys(methods)) {
        // array for middlewares
        const middlewares = [];
        // first middleware query validation (if need=> query para in configuration)
        // validation schemas must be in the configuration
        if (methods[m].query) {
            const qValSchema = (_a = methods[m].query) === null || _a === void 0 ? void 0 : _a.validationSchema;
            // TODO : implement a validation schema for configuration
            if (qValSchema == undefined) {
                throw new Error(`ERROR: Missing  query parameter validation schema \
for url ${methods[m].globalUrl} method ${m}`);
            }
            else {
                middlewares.push(validation(validator, qValSchema, 'query'));
            }
        }
        // second middleware body validation (if need=> body para in configuration)
        // validation schemas must be in the configuration
        if (methods[m].body) {
            const bValSchema = (_b = methods[m].body) === null || _b === void 0 ? void 0 : _b.validationSchema;
            // TODO : implement a validation schema for configuration
            if (bValSchema == undefined) {
                throw new Error(`ERROR: missing body parameter validation schema \
for url ${methods[m].globalUrl} method ${m}`);
            }
            else {
                middlewares.push(validation(validator, bValSchema, 'body'));
            }
        }
        // generation of other middlewares (transformations para in configuration)
        const transfos = methods[m].transformations;
        if (transfos) {
            for (const t of transfos) {
                const fdescription = transformations[t].function;
                const middlewareFct = (new Function(fdescription.arguments, fdescription.body));
                middlewares.push(middlewareFct);
            }
        }
        // last middleware to transform API request to RemoteService message
        // A template of the RemoteService service message must be in the configuration
        const remoteObj = methods[m].remoteService;
        // TODO : implement a validation schema for configuration
        if (remoteObj == undefined) {
            throw new Error(`ERROR: missing target remote service \
for url ${methods[m].globalUrl} method ${m}`);
        }
        else {
            // eslint-disable-next-line max-len
            const remote = remoteObj.service;
            // eslint-disable-next-line max-len
            const targetRemoteTemplate = remoteServices.services[remote];
            middlewares.push(buildRemoteMessage(targetRemoteTemplate));
        }
        // edd middleware to the route for the method
        switch (m.toLowerCase()) {
            case 'get':
                route.get(middlewares);
                break;
            case 'put':
                route.put(middlewares);
                break;
            case 'delete':
                route.delete(middlewares);
                break;
            case 'post':
                route.post(middlewares);
                break;
            case 'patch':
                route.patch(middlewares);
                break;
            case 'subscribe':
                route.subscribe(middlewares);
                break;
            default:
                throw new Error(`ERROR: methods ${m} not implemeted \
        on the configurable router yet`);
        }
    }
    // return a router with configuration
    return router;
}
/**
 * Middleware to validate the query and body parameters
 * @param {Ajv} validator AJV lib validator object
 * @param {string} schema validation schema id
 * @param {string} target target to validate ['query'|'body]
 * @return {function} express middleware performing the validation
 */
function validation(validator, schema, target) {
    return function (request, response, next) {
        const validate = validator.getSchema(schema);
        let data;
        if (validate == undefined) {
            throw new Error(`API validation schema <${schema}> not exist\
        for remote service /${request.baseUrl}/${request.path}`);
        }
        switch (target) {
            case 'query':
                data = request.query;
                break;
            case 'body':
                data = request.body;
                break;
        }
        if (validate(data)) {
            next();
        }
        else {
            // if not validate
            // define the error code
            const errorCode = target == 'query' ?
                'ERR_QUERY_PARAM' :
                'ERR_BODY_PARAM';
            // instanciate a validation error
            const error = new proxy_error_1.RequestValidationError(errorCode, 
            // eslint-disable-next-line max-len
            `ERROR: Request is not valid, some parameters on ${target} are missing/invalid`);
            // add AVJ error object
            error.addErrors(validate.errors);
            // pass error to the next middleware
            next(error);
        }
    };
}
/**
 * build message adapted to the target protocol client
 * @param {object} jsonRemoteTemplate a json template of message
 * @return {function} an express middleware building the message
 */
function buildRemoteMessage(jsonRemoteTemplate) {
    return function (request, response, next) {
        // create a json template with templateParser
        const template = json_templates_1.default(jsonRemoteTemplate);
        // get data from query and body
        const data = request.query;
        if (request.body && request.body.data) {
            data.value = request.body.data;
        }
        // LOG
        console.log(data);
        // build a RemoteMessage with template and data
        const remoteMessage = template(data);
        console.log(JSON.stringify(remoteMessage));
        // store the RemoteMessage in the response.locals
        response.locals.remoteMessage = remoteMessage;
        // next middleware
        next();
    };
}
