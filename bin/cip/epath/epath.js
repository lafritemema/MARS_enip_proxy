"use strict";
// import {SegmentFactory} from './segments/segment_factory';
// import {Segment} from './segments/segment';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EPath = void 0;
const segment_1 = __importStar(require("./segment")), SEGMENT = segment_1;
/**
 * @class EPath
 */
class EPath {
    /**
     * @constructor
     * @param {Segment[]} segments list of segments contained in the path
     */
    constructor(segments = []) {
        this._segmentList = segments;
    }
    /**
     * Browse the buffer iterator to extract data describing the Epath
     * @param {Buffer} pathBuffer : hex buffer to parse
     * @return {Path} EPath instance
    public static parse(pathBuffer:Buffer): EPath {
      // get only the 3 higher bits describing the segment to get the segment type
      // to obtain the type code
  
      const segments : Segment[] = [];
      console.log(pathBuffer);
      const segIterator = new SEGMENT.Iterator(pathBuffer);
      let segIt:SEGMENT.Iteration = segIterator.next();
  
      while (!segIt.done) {
        const segment = <Segment>segIt.value; // add segment type to avoid ts error
        segments.push(segment);
        segIt = segIterator.next();
      }
  
      return new EPath(segments);
    }*/
    /**
     * Browse the buffer iterator to extract data describing the Epath
     * @param {BufferIterator} bufferIterator the buffer iterator containing epath data
     * @param {number} pathSize number of segments in the epath
     * @return {Path} EPath instance
     */
    static parse(bufferIterator, pathSize) {
        const segments = [];
        const segIterator = new SEGMENT.Iterator(bufferIterator, pathSize);
        let segIt = segIterator.next();
        while (!segIt.done) {
            const segment = segIt.value; // add segment type to avoid ts error
            segments.push(segment);
            segIt = segIterator.next();
        }
        return new EPath(segments);
    }
    /**
     * Get the EPath length in byte
     * @return {number} epath length in byte
     */
    get lenght() {
        let length = 0;
        for (const s of this._segmentList) {
            length += s.length;
        }
        return length;
    }
    /**
     * Get the number of segments contained in the EPath
     * @return {number} number of segments
     */
    get pathSize() {
        return this._segmentList.length;
    }
    /**
     * Get the segment at a specified index in the EPath
     * @param {number} index segment index
     * @return {Segment} the segment at the specified index
     */
    getSegment(index) {
        return this._segmentList[index];
    }
    /**
     * Add one or several segments in the path
     * @param {Segment|Segment[]} segment segment to add
     */
    addSegment(segment) {
        if (segment instanceof segment_1.default) {
            this._segmentList.push(segment);
        }
        else {
            this._segmentList.concat(segment);
        }
    }
    /**
     * Build a buffer describing the path
     * @return {Buffer} A buffer describing the path
     */
    encode() {
        const bufferList = [];
        // bufferList.push(Buffer.from([this._segmentList.length]));
        for (const s of this._segmentList) {
            bufferList.push(s.encode());
        }
        return Buffer.concat(bufferList);
    }
    /**
     * Convert the epath instance to JSON
     * @return {object} the JSON representation
     */
    toJSON() {
        return this._segmentList.map((s) => s.toJSON());
    }
    ;
}
exports.EPath = EPath;
