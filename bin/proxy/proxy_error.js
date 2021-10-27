"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataHanlderError = exports.TargetProtocolError = exports.RequestValidationError = exports.RequestUrlError = exports.ProxyError = void 0;
/**
 * Error class describing a proxy error
 */
class ProxyError extends Error {
    /**
     * ProxyError constructor
     * @param {number} httpCode HTTP error code
     * @param {string} code code describing error
     * @param {string} message message describing error
     */
    constructor(httpCode, code, message) {
        super();
        this.httpCode = httpCode;
        this.code = code;
        this.message = message;
    }
    /**
     * get the error json representation
     * @return {ProxyErrorJSON} a json describing the error
     */
    toJSON() {
        return {
            // httpCode: this.httpCode,
            code: this.code,
            message: this.message,
        };
    }
}
exports.ProxyError = ProxyError;
/**
 * Error class describing a RequestUrlError
 */
class RequestUrlError extends ProxyError {
    /**
     * RequestUrlError constructor
     * @param {string} path unvalid path
     */
    constructor(path) {
        super(404, 'ERR_BAD_URL', `no API service exists on path ${path}`);
    }
}
exports.RequestUrlError = RequestUrlError;
/**
 * Error class describing a request validation error
 */
class RequestValidationError extends ProxyError {
    /**
     * RequestValidationError constructor
     * @param {string} code code describing error
     * @param {string} message message describing error
     */
    constructor(code, message) {
        super(406, code, message);
        this.errors = [];
    }
    /**
     * add AJV lib ErrorObjects in the instance
     * @param {ErrorObject[]} ajvErrors AJV Librairie ErrorObject array
     * @param {string} target target for the validation
     */
    addErrors(ajvErrors) {
        for (const err of ajvErrors) {
            this.errors.push(parseAjvError(err));
        }
    }
    /**
     * get the error json representation
     * @return {ProxyErrorJSON} a json describing the error
     */
    toJSON() {
        return Object.assign(Object.assign({}, super.toJSON()), { errors: this.errors });
    }
}
exports.RequestValidationError = RequestValidationError;
/**
 * parse an AJV DefinedError object to extract informations
 * @param {DefinedError} error AJV DefinedError object
 * @return {ValidationErrorDetail} error under ValidationErrorDetail
 */
function parseAjvError(error) {
    let valError;
    switch (error.keyword) {
        case 'required':
            valError = {
                type: 'MISSING_PROPERTY',
                // eslint-disable-next-line max-len
                message: `property ${error.params.missingProperty} is missing`,
            };
            break;
        case 'minItems':
            valError = {
                type: 'BAD_ARRAY_SIZE',
                // eslint-disable-next-line max-len
                message: `property <${error.instancePath}> must contains an array of minimum ${error.params.limit} elements`,
            };
            break;
        case 'maxItems':
            valError = {
                type: 'BAD_ARRAY_SIZE',
                // eslint-disable-next-line max-len
                message: `property <${error.instancePath}> must contains an array of maximum ${error.params.limit} elements`,
            };
            break;
        case 'maxLength':
            valError = {
                type: 'BAD_STRING_LENGTH',
                // eslint-disable-next-line max-len
                message: `property <${error.instancePath}> must contains an string with max length ${error.params.limit}`,
            };
            break;
        case 'type':
            valError = {
                type: 'BAD_TYPE',
                // eslint-disable-next-line max-len
                message: `property <${error.instancePath}> must be a ${error.params.type} type`,
            };
            break;
        case 'maximum':
            valError = {
                type: 'BAD_VALUE',
                // eslint-disable-next-line max-len
                message: `property <${error.instancePath}> must be lower than ${error.params.limit}`,
            };
            break;
        case 'minimum':
            valError = {
                type: 'BAD_VALUE',
                // eslint-disable-next-line max-len
                message: `property <${error.instancePath}> must be upper than ${error.params.limit}`,
            };
            break;
        case 'enum': {
            valError = {
                type: 'BAD_VALUE',
                // eslint-disable-next-line max-len
                message: `property <${error.instancePath}> value must be one of these value => ${error.params.allowedValues}`,
            };
            break;
        }
        case 'if':
            valError = {
                type: 'BAD_VALUE',
                // eslint-disable-next-line max-len
                message: `incompatibility beetween property <${error.instancePath}> and property ${error.params.failingKeyword}`,
            };
            break;
        default:
            // eslint-disable-next-line max-len
            throw new Error(`error ${error.keyword} on property ${error.instancePath}\n${error.message}`);
    }
    return valError;
}
/**
 * Error class describing protocol error
 */
class TargetProtocolError extends ProxyError {
    /**
     * TargetProtocolError constructor
     * @param {string} code code describing the error
     * @param {string} message message describing the error
     */
    constructor(code, message) {
        super(503, code, message);
    }
}
exports.TargetProtocolError = TargetProtocolError;
/**
 * Error class describing data handling error
 */
class DataHanlderError extends ProxyError {
    /**
     * DataHanlderError constructor
     * @param {string} message message describing the error
     */
    constructor(message) {
        super(503, 'ERR_DATA_HANDLING', message);
    }
}
exports.DataHanlderError = DataHanlderError;
/*
export class ConfigurationError extends ProxyError {
  constructor(message:string) {
    super(503, 'ERR_DATA_HANDLING', message);
  }
}
*/ 
