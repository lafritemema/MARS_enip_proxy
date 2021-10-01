import {DefinedError, ErrorObject} from 'ajv';

interface ProxyErrorJSON {
  // httpCode:number,
  code:string,
  message:string,
}

interface ValidationErrorDetail {
  type:string,
  message:string,
}

interface RequestValidationErrorJSON extends ProxyErrorJSON{
  errors:ValidationErrorDetail[]
}

/**
 * Error class describing a proxy error
 */
export class ProxyError extends Error {
  public httpCode:number;
  public code:string;

  /**
   * ProxyError constructor
   * @param {number} httpCode HTTP error code
   * @param {string} code code describing error
   * @param {string} message message describing error
   */
  constructor(httpCode:number, code:string, message:string) {
    super();
    this.httpCode=httpCode;
    this.code=code;
    this.message=message;
  }

  /**
   * get the error json representation
   * @return {ProxyErrorJSON} a json describing the error
   */
  public toJSON():ProxyErrorJSON {
    return {
      // httpCode: this.httpCode,
      code: this.code,
      message: this.message,
    };
  }
}

/**
 * Error class describing a RequestUrlError
 */
export class RequestUrlError extends ProxyError {
  /**
   * RequestUrlError constructor
   * @param {string} path unvalid path
   */
  constructor(path:string) {
    super(404, 'ERR_BAD_URL', `no API service exists on path ${path}`);
  }
}


/**
 * Error class describing a request validation error
 */
export class RequestValidationError extends ProxyError {
  public errors:ValidationErrorDetail[]=[]

  /**
   * RequestValidationError constructor
   * @param {string} code code describing error
   * @param {string} message message describing error
   */
  constructor(code:string, message:string) {
    super(406, code, message);
  }

  /**
   * add AJV lib ErrorObjects in the instance
   * @param {ErrorObject[]} ajvErrors AJV Librairie ErrorObject array
   * @param {string} target target for the validation
   */
  public addErrors(ajvErrors:ErrorObject[]) {
    for (const err of ajvErrors as DefinedError[]) {
      this.errors.push(parseAjvError(err));
    }
  }

  /**
   * get the error json representation
   * @return {ProxyErrorJSON} a json describing the error
   */
  public toJSON():RequestValidationErrorJSON {
    return {...super.toJSON(),
      errors: this.errors,
    };
  }
}

/**
 * parse an AJV DefinedError object to extract informations
 * @param {DefinedError} error AJV DefinedError object
 * @return {ValidationErrorDetail} error under ValidationErrorDetail
 */
function parseAjvError(error:DefinedError): ValidationErrorDetail {
  let valError:ValidationErrorDetail;

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
export class TargetProtocolError extends ProxyError {
  /**
   * TargetProtocolError constructor
   * @param {string} code code describing the error
   * @param {string} message message describing the error
   */
  constructor(code:string, message:string) {
    super(503, code, message);
  }
}

/**
 * Error class describing data handling error
 */
export class DataHanlderError extends ProxyError {
  /**
   * DataHanlderError constructor
   * @param {string} message message describing the error
   */
  constructor(message:string) {
    super(503, 'ERR_DATA_HANDLING', message);
  }
}
/*
export class ConfigurationError extends ProxyError {
  constructor(message:string) {
    super(503, 'ERR_DATA_HANDLING', message);
  }
}
*/