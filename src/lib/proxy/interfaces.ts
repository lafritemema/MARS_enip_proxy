import {Configuration} from '@common/interfaces';
import {ServerConfiguration} from '../server/interfaces';

export interface ProxyServerConfiguration extends ServerConfiguration {
  enip?:EnipConfiguration
}

export interface EnipConfiguration {
  host:string,
  port:number,
  activate:boolean
}

export interface APIRegister extends Configuration {
  paths:{[path:string]:RegPath},
  remoteServices:{[service:string]:RegRemoteService}
  validationSchemas:{[schema:string]:RegValidationSchema},
  transformations:{[transfo:string]:Transformation},
}


export interface RegPath {
  description:string,
  urns:{[urn:string]:RegUrn}
}

// type HttpMethod = 'GET'|'PUT'|'SUBSCRIBE'

export interface RegUrn {
  description:string,
  url:string,
  methods:{[method:string]:RegMethod},
}

export interface RegMethod {
  description:string,
  uri:string,
  query:RequestComponentDesc,
  body: RequestComponentDesc
  transformations:string[],
  remoteService:{
    service:string
  }
}

export interface RequestComponentDesc {
  parameters:object[],
  validationSchema:string,
}

export interface RegRemoteService {
  request:object,
  response:object
}

export interface RegValidationSchema {
  schema:object
}

export interface Transformation {
  description:string,
  function:{
    arguments:string,
    body:string
  }
}
