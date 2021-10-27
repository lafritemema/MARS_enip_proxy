import express, {Request, Response, Router} from 'express';
import Ajv, {ErrorObject} from 'ajv';
import templateParser from 'json-templates';

import {RouterConfiguration,
  APIPath,
  RemoteServices,
  Transformations,
  HTTPMethod,
  RemoteMessage} from '../custom/config_interfaces';
import {RequestUrlError,
  RequestValidationError} from '../proxy_error';


// define a middleware type
type ExpressMiddleware = (request:Request,
  response:Response,
  next:()=>void)=>void;

/**
   * buid a router according to the standard configuration
   * @param {RouterConfiguration} routerConfig json configuration file
   * @return {Router} express router
   */
export function buildRouterFromConfig(routerConfig:RouterConfiguration):Router {
  // express router instance
  // eslint-disable-next-line new-cap
  const router = express.Router();

  // Ajv instance for validation
  const validator = new Ajv();

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
      const pathRouter = buildPathRouter(path,
          httpApi[url].paths[path],
          validator,
          remoteServices,
          transformations);

      // add it to global router for the api url
      router.use(url, pathRouter);
    }
  }

  // add a middleware to handle bad url request
  router.use((request:Request,
      response:Response,
      next:(error?:Error)=>void)=> {
    // if no remoteMsg key on request locals => bad url
    if (!response.locals.remoteMessage) {
      next(new RequestUrlError(request.baseUrl+request.path));
    }
    next();
  });

  return router;
}

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
function buildPathRouter(pathUrl:string,
    paths:APIPath,
    validator:Ajv,
    remoteServices:RemoteServices,
    transformations:Record<string, Transformations>):Router {
  // instanciate the path router and define a route
  // eslint-disable-next-line new-cap
  const router = express.Router();
  const route = router.route(pathUrl);


  // create middlewares for each method in the path configuration
  const methods = paths.methods;
  for (const m of Object.keys(methods)) {
    // array for middlewares
    const middlewares:ExpressMiddleware[] = [];

    // first middleware query validation (if need=> query para in configuration)
    // validation schemas must be in the configuration
    if (methods[<HTTPMethod>m].query) {
      const qValSchema = methods[<HTTPMethod>m].query?.validationSchema;

      // TODO : implement a validation schema for configuration
      if (qValSchema == undefined) {
        throw new Error(`ERROR: Missing  query parameter validation schema \
for url ${methods[<HTTPMethod>m].globalUrl} method ${m}`);
      } else {
        middlewares.push(validation(validator, qValSchema, 'query'));
      }
    }

    // second middleware body validation (if need=> body para in configuration)
    // validation schemas must be in the configuration
    if (methods[<HTTPMethod>m].body) {
      const bValSchema = methods[<HTTPMethod>m].body?.validationSchema;

      // TODO : implement a validation schema for configuration
      if (bValSchema == undefined) {
        throw new Error(`ERROR: missing body parameter validation schema \
for url ${methods[<HTTPMethod>m].globalUrl} method ${m}`);
      } else {
        middlewares.push(validation(validator, bValSchema, 'body'));
      }
    }

    // generation of other middlewares (transformations para in configuration)
    const transfos = methods[<HTTPMethod>m].transformations;
    if (transfos) {
      for (const t of transfos) {
        const fdescription = transformations[t].function;
        const middlewareFct = <ExpressMiddleware>(new Function(
            fdescription.arguments,
            fdescription.body));
        middlewares.push(middlewareFct);
      }
    }

    // last middleware to transform API request to RemoteService message
    // A template of the RemoteService service message must be in the configuration
    const remoteObj = methods[<HTTPMethod>m].remoteService;
    // TODO : implement a validation schema for configuration
    if (remoteObj == undefined) {
      throw new Error(`ERROR: missing target remote service \
for url ${methods[<HTTPMethod>m].globalUrl} method ${m}`);
    } else {
      // eslint-disable-next-line max-len

      const remote = remoteObj.service;
      // eslint-disable-next-line max-len
      const targetRemoteTemplate = remoteServices.services[<string>remote];
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
function validation(validator:Ajv,
    schema:string,
    target:'query'|'body'):ExpressMiddleware {
  return function(request:Request,
      response:Response,
      next:(error?:Error)=>void) {
    const validate = validator.getSchema(schema);
    let data:object;

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
    } else {
      // if not validate
      // define the error code
      const errorCode = target == 'query' ?
       'ERR_QUERY_PARAM' :
       'ERR_BODY_PARAM';

      // instanciate a validation error
      const error = new RequestValidationError(
          errorCode,
          // eslint-disable-next-line max-len
          `ERROR: Request is not valid, some parameters on ${target} are missing/invalid`,
      );

      // add AVJ error object
      error.addErrors(<ErrorObject[]>validate.errors);
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
function buildRemoteMessage(
    jsonRemoteTemplate:object):ExpressMiddleware {
  return function(request:Request,
      response:Response,
      next:()=>void) {
    // create a json template with templateParser
    const template = templateParser(jsonRemoteTemplate);

    // get data from query and body
    const data = request.query;
    if (request.body && request.body.data) {
      data.value = request.body.data;
    }
    // LOG
    console.log(data);
    // build a RemoteMessage with template and data
    const remoteMessage = <RemoteMessage><unknown>template(data);
    console.log(JSON.stringify(remoteMessage));
    // store the RemoteMessage in the response.locals
    response.locals.remoteMessage = remoteMessage;
    // next middleware
    next();
  };
}
