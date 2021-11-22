"use strict";
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
exports.SegmentIterator = void 0;
const logical_1 = __importStar(require("./logical")), logical = logical_1;
const segment_type_1 = require("./segment_type"); /* SegmentType,
SegmentTypeKeys,
SegmentTypeObject,
checkSegmentType*/
/**
 * Class describing a SegmentIterator
 */
class SegmentIterator {
    /**
     * SegmentIterator instance constructor
     * @param {BufferIterator} bufferIterator BufferIterator to browse to extract segments
     * @param {number} iteratorSize number of segment in the iterator
     */
    constructor(bufferIterator, iteratorSize) {
        this._buffIt = bufferIterator;
        this._iteratorSize = iteratorSize;
        this._iterationNbr = 0;
    }
    /**
     * Iteration function to parse and extract items
     * @return {SegmentIteration} object containing the next item if exist
     */
    next() {
        const segmentIt = this._buffIt.next();
        if (this._iterationNbr < this._iteratorSize) {
            const metaBuffer = segmentIt.value;
            const segmentType = segment_type_1.extractSegmentType(metaBuffer);
            let typedSegment;
            switch (segmentType) {
                case segment_type_1.SegmentType.LOGICAL:
                    const logicalType = logical.extractLogicalType(metaBuffer);
                    const logicalFormat = logical.extractLogicalFormat(metaBuffer);
                    const segmentSize = logical.getLogicalProcessor(logicalFormat).size;
                    // padded encoding so if logical segment format 16 or 32 bits on pad byte to pass
                    if (logicalFormat == logical.Format.BIT_16 ||
                        logicalFormat == logical.Format.BIT_32) {
                        this._buffIt.pass();
                    }
                    const dataBuffer = this._buffIt.next(segmentSize).value;
                    typedSegment = new logical_1.default(logicalType, logicalFormat, dataBuffer);
                    break;
                default:
                    // eslint-disable-next-line max-len
                    throw new Error(`Segment type code <${segmentType} is not valid or not implemented yet`);
            }
            this._iterationNbr += 1;
            return { value: typedSegment, done: false };
        }
        else {
            return { value: undefined, done: true };
        }
    }
}
exports.SegmentIterator = SegmentIterator;
