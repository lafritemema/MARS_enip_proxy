import {BufferIterator} from 'utils';
import {Segment} from './segment';
import LogicalSegment, * as logical from './logical';
import {extractSegmentType,
  SegmentType} from './segment_type'; /* SegmentType,
SegmentTypeKeys,
SegmentTypeObject,
checkSegmentType*/

export interface SegmentIteration {
  value:Segment|undefined,
  done:Boolean,
}

/**
 * Class describing a SegmentIterator
 */
export class SegmentIterator {
  private _buffIt:BufferIterator;
  private _iteratorSize:number;
  private _iterationNbr:number;

  /**
   * SegmentIterator instance constructor
   * @param {BufferIterator} bufferIterator BufferIterator to browse to extract segments
   * @param {number} iteratorSize number of segment in the iterator
   */
  public constructor(bufferIterator:BufferIterator, iteratorSize:number) {
    this._buffIt = bufferIterator;
    this._iteratorSize=iteratorSize;
    this._iterationNbr=0;
  }

  /**
   * Iteration function to parse and extract items
   * @return {SegmentIteration} object containing the next item if exist
   */
  public next():SegmentIteration {
    const segmentIt = this._buffIt.next();

    if (this._iterationNbr < this._iteratorSize) {
      const metaBuffer = segmentIt.value;

      const segmentType = extractSegmentType(metaBuffer);
      let typedSegment:Segment;

      switch (segmentType) {
        case SegmentType.LOGICAL:
          const logicalType = logical.extractLogicalType(metaBuffer);
          const logicalFormat = logical.extractLogicalFormat(metaBuffer);
          const segmentSize= logical.getLogicalProcessor(logicalFormat).size;

          // padded encoding so if logical segment format 16 or 32 bits on pad byte to pass
          if (logicalFormat == logical.Format.BIT_16 ||
            logicalFormat == logical.Format.BIT_32) {
            this._buffIt.pass();
          }

          const dataBuffer = this._buffIt.next(segmentSize).value;

          typedSegment = new LogicalSegment(logicalType,
              logicalFormat,
              dataBuffer);
          break;
        default:
          // eslint-disable-next-line max-len
          throw new Error(`Segment type code <${segmentType} is not valid or not implemented yet`);
      }
      this._iterationNbr+=1;
      return {value: typedSegment, done: false};
    } else {
      return {value: undefined, done: true};
    }
  }
}
