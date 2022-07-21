import Logger from '@common/logger';
import NodeCache from 'node-cache';
import {RequestData} from './enip_client';

type requestType = 'standard' | 'tracker'
type trackerStatus = 'running' | 'end'

interface CachePacket extends RequestData {
  requestType:requestType
}
interface TrackerCachePacket extends CachePacket {
  status:trackerStatus
}

/**
 * class describing a tracker register
 */
export class RequestRegister {
  private _cache:NodeCache;
  private _logger = new Logger('REQREGISTER')
  /**
   * tracker register constructor
   */
  constructor() {
    this._cache = new NodeCache();
  }

  /**
   * function to add a request in the request register
   * @param {string} requestId the request uniq id
   * @param {RequestData} data the response type
   */
  public addRequest(requestId:string, data:RequestData) {
    this._logger.debug(`REQUEST ${requestId} - add request in register`);
    const cpacket:CachePacket = {requestType: 'standard', ...data};
    this._cache.set(requestId, cpacket);
  }

  /**
   * function to add a tracker type request in the request register
   * @param {string} trackerId the request uniq id
   * @param {RequestData} data the response type
   */
  public addTracker(trackerId:string, data:RequestData) {
    this._logger.debug(`TRACKER ${trackerId} - add tracker in register`);
    const cpacket:TrackerCachePacket = {...data,
      requestType: 'tracker',
      status: 'running',
    };
    this._cache.set(trackerId, cpacket);
  }

  /**
   * function to get the request data,
   * if standard request data are deleted from register
   * if tracker request data still until clearTracker func
   * @param {string} requestId the request uniq id
   * @return {RequestData} the request data
   */
  public getData<RD extends RequestData>(requestId:string):RD {
    const cpacket = this._cache.get<CachePacket>(requestId);
    if (cpacket) {
      const {requestType, ...data} = cpacket;

      if (requestType == 'standard') {
        this._logger.debug(`REQUEST ${requestId} - delete request from register`);
        this._cache.del(requestId);
      }

      return <RD>data;
    } else {
      throw new Error(`requestId ${requestId} not exist in request register`);
    }
  }

  /**
   * fonction to stop a tracker (status en in request register)
   * @param {string} trackerId the tracker uniq id
   */
  public stopTracker(trackerId:string) {
    const cpacket = this._cache.get<TrackerCachePacket>(trackerId);
    if (cpacket) {
      const {responseType} = cpacket;
      this._logger.debug(`TRACKER ${trackerId} - stop tracker`);
      this._cache.set(trackerId, {
        responseType: responseType,
        status: 'end',
      });
    } else {
      throw new Error(`requestId ${trackerId} not exist in request register`);
    }
  }

  /**
   * function to clear a tracker in request register
   * @param {string} trackerId the request uniq id
   */
  public clearTracker(trackerId:string) {
    this._logger.debug(`TRACKER ${trackerId} - delete tracker from register`);
    this._cache.del(trackerId);
  }

  /**
   * function to check if a request exist in register
   * @param {string} requestId the request uniq id
   * @return {boolean} true if request exist on request register
   */
  public hasRequest(requestId:string) {
    const exist = this._cache.has(requestId);
    this._logger.debug(`REQUEST ${requestId} - check request exist in register => ${exist}`);
    return exist;
  }

  /**
   * function to check if request is running
   * @param {string} requestId
   * @return {boolean} true if running
   */
  public isRunning(requestId:string) {
    if (this._cache.has(requestId)) {
      const reqData = this._cache.get<TrackerCachePacket>(requestId);
      const running = reqData?.status && reqData.status == 'running';
      this._logger.debug(`REQUEST ${requestId} - check request running => ${running}`);
      return running;
    }
  }
}
