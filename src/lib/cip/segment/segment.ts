
// import * as _ from 'lodash';

/**
 * @class Segment
 * @abstract
 */
export abstract class Segment {
    private _stype:number;
    /**
     * test
     * @param {SegmentTypeKeys} stype test
     */
    protected constructor(stype:number) {
      this._stype = stype;
    }
    public abstract get length():number;
    public abstract get dataLength():number;
    public abstract parseMeta(metaBuffer:Buffer):void;
    public abstract parseData(dataBuffer:Buffer):void;
    public abstract encode():Buffer;
    public abstract toJSON():object;
}

