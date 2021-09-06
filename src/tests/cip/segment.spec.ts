import {Logical} from 'cip/epath/segment';

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
    const segment = Logical.Segment.parseMeta(metaBuffer);
    const dataBuffer = buff16.slice(1, segment.dataLength + 1);
    segment.parseData(dataBuffer);

    expect(segment.toJSON()).toStrictEqual(obj16);
  });
  test('Parse logical 32 bit buffer', ()=>{
    const metaBuffer = buff32.slice(0, 1);
    const segment = Logical.Segment.parseMeta(metaBuffer);
    const dataBuffer = buff32.slice(1, segment.dataLength + 1);
    segment.parseData(dataBuffer);

    expect(segment.toJSON()).toStrictEqual(obj32);
  });
  test('Parse logical 40 bit buffer', ()=> {
    const metaBuffer = buff40.slice(0, 1);
    const segment = Logical.Segment.parseMeta(metaBuffer);

    const dataBuffer = buff40.slice(1, segment.dataLength + 1);
    segment.parseData(dataBuffer);

    expect(segment.toJSON()).toStrictEqual(obj40);
  });
  test('Encode a logical segment with 8 bit value size', ()=>{
    // @ts-ignore
    const segment = new Logical.Segment(Logical.Type.CLASS_ID,
        Logical.Format.BIT_8,
        0x6c);
    const buffer = segment.encode();
    expect(buffer).toStrictEqual(buff16);
  });
  test('Encode a logical segment with 16 bit value size', ()=>{
    // @ts-ignore
    const segment = new Logical.Segment(Logical.Type.ATTRIBUTE_ID,
        Logical.Format.BIT_16,
        37158);
    const buffer = segment.encode();
    expect(buffer).toStrictEqual(buff32);
  });
  test('Encode a logical segment with 32 bit value size', ()=>{
    // @ts-ignore
    const segment = new Logical.Segment(Logical.Type.CONNECTION_POINT,
        Logical.Format.BIT_32,
        639996198);
    const buffer = segment.encode();
    expect(buffer).toStrictEqual(buff40);
  });
});
