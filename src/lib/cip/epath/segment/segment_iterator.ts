import {BufferIterator} from 'utils';
import {Segment} from './segment';
import {buildTypedSegment} from './segment_type'; /* SegmentType,
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

  /**
   * SegmentIterator instance constructor
   * @param {Buffer} buffer buffer describing a segment list
   */
  public constructor(buffer:Buffer) {
    this._buffIt = new BufferIterator(buffer);
  }

  /**
   * Iteration function to parse and extract items
   * @return {SegmentIteration} object containing the next item if exist
   */
  public next():SegmentIteration {
    const segmentIt = this._buffIt.next();

    if (!segmentIt.done) {
      const metaBuffer = segmentIt.value;
      // const stcode = extractType(metaBuffer);
      // checkSegmentType(stcode);

      // eslint-disable-next-line max-len
      // const segTypeObj = SegmentTypeObject[<SegmentTypeKeys>SegmentType[stcode]];
      // console.log(segTypeObj);

      const typedSegment = buildTypedSegment(metaBuffer);

      const dataBuffer = this._buffIt.next(typedSegment.dataLength).value;

      typedSegment.parseData(dataBuffer);

      return {value: typedSegment, done: false};
    } else {
      return {value: undefined, done: true};
    }
  }
}
