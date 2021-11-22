"use strict";
// import * as _ from 'lodash';
Object.defineProperty(exports, "__esModule", { value: true });
exports.Segment = void 0;
/**
 * @class Segment
 * @abstract
 */
class Segment {
    /**
     * test
     * @param {SegmentTypeKeys} stype test
     */
    constructor(stype) {
        this._stype = stype;
    }
}
exports.Segment = Segment;
