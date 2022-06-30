import express, {Request, Response, Router} from 'express';
import Ajv, {ErrorObject} from 'ajv';
import templateParser from 'json-templates';

import {
  HTTPMethod,
  RemoteMessage} from '../custom/config_interfaces';
import {RequestUrlError,
  RequestValidationError} from '../proxy_error';
import {APIRegister, RegRemoteService, RegUrn, Transformation} from '../interfaces';


// define a middleware type
type ExpressMiddleware = (request:Request,
  response:Response,
  next:()=>void)=>void;

/**
   * buid a router according to the standard configuration
   * @param {APIRegister} apiRegister json configuration file
   * @return {Router} express router
   */
export function buildRouterFromConfig(apiRegister:APIRegister):Router {
  // express router instance
  // eslint-disable-next-line new-cap
  const router = express.Router();

  // Ajv instance for validation
  const validator = new Ajv();

  /* get the configuration
  const httpApi = routerConfig.httpAPI.baseUrls;
  const remoteServices = routerConfig.remoteServices;
  const validationSchemas = routerConfig.validationSchemas.schemas;
  const transformations = routerConfig.transformations;
  */
  const {paths,
    remoteServices,
    validationSchemas,
    transformations} = apiRegister;

  // inject all shemas from configuration to validator
  for (const vs of Object.keys(validationSchemas)) {
    validator.addSchema(validationSchemas[vs].schema);
  }

  /* build the routes from api configuration
  for (const url of Object.keys(paths)) {
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
  */
  // for each paths
  for (const pathkey of Object.keys(paths)) {
    // for each urn in path
    for (const urnkey of Object.keys(paths[pathkey].urns)) {
      // build a path router using buildPathRouter function
      const pathRouter = buildPathRouter(
          urnkey, // the urn key
          paths[pathkey].urns[urnkey], // the urn element
          validator, // the validator object
          remoteServices, // the remote service register
          transformations, // the transformation register
      );
      // associate the router to the pathkey
      router.use(pathkey, pathRouter);
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
 * @param {string} urnkey the urn key
 * @param {RegUrn} urn object containing informations to build route
 * @param {Avj} validator jsonschema validation object
 * @param {Record<string, RegRemoteService>} remoteServices object describing the target
 * remote service associated to the route method
 * @param {Record<string, Transformation>} transformations
 * object describing additionnal middleware functions to process
 * @return {Router} the express router for path
 */
function buildPathRouter(
    urnkey:string,
    urn:RegUrn,
    validator:Ajv,
    remoteServices:Record<string, RegRemoteService>,
    transformations:Record<string, Transformation>):Router {
  // instanciate the path router and define a route
  // eslint-disable-next-line new-cap
  const router = express.Router();
  const route = router.route(urnkey);

  // create middlewares for each method in the path configuration
  const methods = urn.methods;
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
for url ${methods[<HTTPMethod>m].uri} method ${m}`);
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
for url ${methods[<HTTPMethod>m].uri} method ${m}`);
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
for url ${methods[<HTTPMethod>m].uri} method ${m}`);
    } else {
      // eslint-disable-next-line max-len

      const remote = remoteObj.service;
      // eslint-disable-next-line max-len
      const targetRemoteTemplate = remoteServices[<string>remote];
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
