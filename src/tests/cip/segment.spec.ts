import * as SEGMENT from '../../lib/cip/segment';
import {LogicalSegment} from '../../lib/cip/segment/logical/logical_segment';

describe('Test segment interface', ()=> {
  const obj16 = {
    _stype: 'LOGICAL',
    _type: 'CLASS_ID',
    _format: '8_BIT',
    _value: 108};
  const buff16 = Buffer.from([0x20, 0x6c]);

  const obj32 = {
    _stype: 'LOGICAL',
    _type: 'ATTRIBUTE_ID',
    _format: '16_BIT',
    _value: 37158};
  const buff32 = Buffer.from([0x31, 0x26, 0x91]);

  const obj40 = {
    _stype: 'LOGICAL',
    _type: 'CONNECTION_POINT',
    _format: '32_BIT',
    _value: 639996198};

  const buff40 = Buffer.from([0x2E, 0x26, 0x91, 0x25, 0x26]);

  test('Parse logical 16 bit buffer', ()=>{
    const metaBuffer = buff16.slice(0, 1);
    const segment = SEGMENT.parseMeta(metaBuffer);
    const dataBuffer = buff16.slice(1, segment.dataSize + 1);
    segment.parseData(dataBuffer);

    const {...seg} = segment;
    expect(seg).toStrictEqual(obj16);
  });
  test('Parse logical 32 bit buffer', ()=>{
    const metaBuffer = buff32.slice(0, 1);
    const segment = SEGMENT.parseMeta(metaBuffer);
    const dataBuffer = buff32.slice(1, segment.dataSize + 1);
    segment.parseData(dataBuffer);

    const {...seg} = segment;
    expect(seg).toStrictEqual(obj32);
  });
  test('Parse logical 40 bit buffer', ()=>{
    const metaBuffer = buff40.slice(0, 1);
    const segment = SEGMENT.parseMeta(metaBuffer);

    const dataBuffer = buff40.slice(1, segment.dataSize + 1);
    segment.parseData(dataBuffer);

    const {...seg} = segment;
    expect(seg).toStrictEqual(obj40);
  });
  test('Build logical 16 bit buffer', ()=>{
    // @ts-ignore
    const segment = new LogicalSegment(obj16._type,
        obj16._format,
        obj16._value);
    const buffer = segment.build();
    expect(buffer).toStrictEqual(buff16);
  });
  test('Build logical 32 bit buffer', ()=>{
    // @ts-ignore
    const segment = new LogicalSegment(obj32._type,
        obj32._format,
        obj32._value);
    const buffer = segment.build();
    expect(buffer).toStrictEqual(buff32);
  });
  test('Build logical 40 bit buffer', ()=>{
    // @ts-ignore
    const segment = new LogicalSegment(obj40._type,
        obj40._format,
        obj40._value);
    const buffer = segment.build();
    expect(buffer).toStrictEqual(buff40);
  });
});
