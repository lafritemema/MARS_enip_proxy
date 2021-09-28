import {LogicalSegment} from './logical_segment';
import {LogicalFormat,
  extractLogicalFormat,
  getLogicalProcessor} from './logical_format';
import {LogicalType, extractLogicalType} from './logical_type';

export default LogicalSegment;
export {
  LogicalFormat as Format,
  LogicalType as Type,
  getLogicalProcessor,
  extractLogicalType,
  extractLogicalFormat,
};

