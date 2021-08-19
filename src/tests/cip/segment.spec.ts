import * as SEGMENT from '../../lib/cip/segment';
import {LogicalFormat} from '../../lib/cip/segment/logical/logical_format';
import {LogicalSegment} from '../../lib/cip/segment/logical/logical_segment';
import {LogicalType} from '../../lib/cip/segment/logical/logical_type';

describe('Test segment interface', ()=> {
  const obj16 = {
    segment: 'LOGICAL',
    type: 'CLASS_ID',
    format: 'BIT_8',
    value: 108};
  const buff16 = Buffer.from([0x20, 0x6c]);

  const obj32 = {
    segment: 'LOGICAL',
    type: 'ATTRIBUTE_ID',
    format: 'BIT_16',
    value: 37158};
  const buff32 = Buffer.from([0x31, 0x26, 0x91]);

  const obj40 = {
    segment: 'LOGICAL',
    type: 'CONNECTION_POINT',
    format: 'BIT_32',
    value: 639996198};

  const buff40 = Buffer.from([0x2E, 0x26, 0x91, 0x25, 0x26]);

  test('Parse logical 16 bit buffer', ()=>{
    const metaBuffer = buff16.slice(0, 1);
    const segment = SEGMENT.parseMeta(metaBuffer);
    const dataBuffer = buff16.slice(1, segment.dataLength + 1);
    segment.parseData(dataBuffer);

    expect(segment.toJSON()).toStrictEqual(obj16);
  });
  test('Parse logical 32 bit buffer', ()=>{
    const metaBuffer = buff32.slice(0, 1);
    const segment = SEGMENT.parseMeta(metaBuffer);
    const dataBuffer = buff32.slice(1, segment.dataLength + 1);
    segment.parseData(dataBuffer);

    expect(segment.toJSON()).toStrictEqual(obj32);
  });
  test('Parse logical 40 bit buffer', ()=>{
    const metaBuffer = buff40.slice(0, 1);
    const segment = SEGMENT.parseMeta(metaBuffer);

    const dataBuffer = buff40.slice(1, segment.dataLength + 1);
    segment.parseData(dataBuffer);

    expect(segment.toJSON()).toStrictEqual(obj40);
  });
  test('Encode a logical segment with 8 bit value size', ()=>{
    // @ts-ignore
    const segment = new LogicalSegment(LogicalType.CLASS_ID,
        LogicalFormat.BIT_8,
        0x6c);
    const buffer = segment.encode();
    expect(buffer).toStrictEqual(buff16);
  });
  test('Encode a logical segment with 16 bit value size', ()=>{
    // @ts-ignore
    const segment = new LogicalSegment(LogicalType.ATTRIBUTE_ID,
        LogicalFormat.BIT_16,
        37158);
    const buffer = segment.encode();
    expect(buffer).toStrictEqual(buff32);
  });
  test('Encode a logical segment with 32 bit value size', ()=>{
    // @ts-ignore
    const segment = new LogicalSegment(LogicalType.CONNECTION_POINT,
        LogicalFormat.BIT_32,
        639996198);
    const buffer = segment.encode();
    expect(buffer).toStrictEqual(buff40);
  });
});
