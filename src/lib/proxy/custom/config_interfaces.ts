import {AnySchemaObject} from 'ajv';

export type HTTPMethod = 'GET'|'POST'|'PUT'|'DELETE'|'PATCH'

export type CipService = 'GET_ATTRIBUTE_BLOCK'|
'GET_ATTRIBUTE_SINGLE'|
'GET_ATTRIBUTE_ALL'|
'SET_ATTRIBUTE_BLOCK'|
'SET_ATTRIBUTE_SINGLE'|
'SET_ATTRIBUTE_ALL';

type CipType = 'REAL'|'STRING'|'INT';
type CipSegmentFormat = 'BIT_8'|'BIT_16'|'BIT_32';

export interface RouterConfiguration {
  httpAPI:HttpAPI;
  remoteServices:RemoteServices;
  validationSchemas:ValidationSchemasConfig;
  transformations:Record<string, Transformations>
}

export interface ValidationSchemasConfig {
  schemas:Record<string, ValidationSchema>
}

export interface ValidationSchema {
  schema:AnySchemaObject
}

export interface HttpAPI {
  baseUrls:Record<string, APIBaseUrl>
}

interface APIBaseUrl {
  description: string,
  paths:Record<string, APIPath>
}

export interface APIPath {
  description:string,
  globalUrl?:string,
  methods:Record<HTTPMethod, MethodRemote>
}

interface MethodRemote {
  description:string,
  globalUrl?:string,
  query?:RequestConfiguration,
  body?:RequestConfiguration,
  remoteService:RemoteObject
  transformations?:Array<string>
}

interface RemoteObject {
  service:string|Record<string, string>
}

interface RequestConfiguration {
  parameters:RequestParameter
  validationSchema:string
}

interface RequestParameter {
  name:string,
  description:string,
  type:string,
  optional: boolean,
}

export interface RemoteServices {
  protocol:string,
  services:Record<string, RemoteMessage>
}

export interface RemoteMessage {
  request:object,
  response:object
}

export interface EnipRemoteMessage extends RemoteMessage{
  request:{
    epath: CipEpath,
    service:CipService
    data:EnipRequestData
  },
  response:{
    type:CipType|'ARRAY',
    items?:{
      type:CipType,
      size:number
    }
  }
}

export interface EnipRequestData {
  type:string,
  items?:{
    type:string
  },
  value:any
}

export interface CipEpath {
  class:CipSegment,
  instance:CipSegment,
  attribute?:CipSegment
}

interface CipSegment {
  type:CipSegmentFormat,
  value:number|number[]
}

export interface Transformations {
  description:string,
  function:{
    arguments:string,
    body:string
  }
}
