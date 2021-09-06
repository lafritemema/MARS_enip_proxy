import {Segment} from './segment';
// import {SegmentType, SegmentTypeObject, SegmentTypeKeys} from './segment_type';
import {LogicalSegment, LogicalType, LogicalFormat} from './logical';
import {SegmentIterator, SegmentIteration} from './segment_iterator';

const Logical = {
  Segment: LogicalSegment,
  Format: LogicalFormat,
  Type: LogicalType,
};

export {Segment,
  SegmentIterator,
  SegmentIteration,
  Logical,
};
