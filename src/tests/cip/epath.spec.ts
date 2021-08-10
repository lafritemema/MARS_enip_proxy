import {Path} from '../../lib/cip/path';
import {LogicalSegment} from '../../lib/cip/segment';

describe('Test path interface', ()=> {
  const expectedSize2 = 2;
  const fExpectObj2 = {
    _stype: 'LOGICAL',
    _type: 'CLASS_ID',
    _format: '8_BIT',
    _value: 108};
  const sExpectObj2 = {
    _stype: 'LOGICAL',
    _type: 'ATTRIBUTE_ID',
    _format: '16_BIT',
    _value: 37158};

  const bufferPath2 = Buffer.from([0x20, 0x6c, 0x31, 0x26, 0x91]);

  const expectedSize3 = 3;
  const fExpectObj3 = {
    _stype: 'LOGICAL',
    _type: 'CLASS_ID',
    _format: '8_BIT',
    _value: 108};
  const sExpectObj3 = {
    _stype: 'LOGICAL',
    _type: 'INSTANCE_ID',
    _format: '8_BIT',
    _value: 1};
  const tExpectObj3 = {
    _stype: 'LOGICAL',
    _type: 'ATTRIBUTE_ID',
    _format: '8_BIT',
    _value: 4};

  const bufferPath3 = Buffer.from([0x20, 0x6c, 0x24, 0x01, 0x30, 0x04]);


  test('Parse path with 2 segment (8 and 16 bits) ', ()=> {
    const path = Path.parse(bufferPath2);
    expect(path.lenght).toEqual(expectedSize2);

    const {...fsegment} = path.getSegment(0);
    const {...ssegment} = path.getSegment(1);

    expect(fsegment).toStrictEqual(fExpectObj2);
    expect(ssegment).toStrictEqual(sExpectObj2);
  });
  /* eslint-disable max-len */
  test('Parse path with 3 segments\n-CLASS SEG\n-INSTANCE SEG\n-ATTRIBUTE SEG', ()=> {
    const path = Path.parse(bufferPath3);
    expect(path.lenght).toEqual(expectedSize3);

    const {...fsegment} = path.getSegment(0);
    const {...ssegment} = path.getSegment(1);
    const {...tsegment} = path.getSegment(2);

    expect(fsegment).toStrictEqual(fExpectObj3);
    expect(ssegment).toStrictEqual(sExpectObj3);
    expect(tsegment).toStrictEqual(tExpectObj3);
  });
  test('Build buffer from path with 2 segments', ()=> {
    const path = new Path();
    // @ts-ignore
    path.addSegment(new LogicalSegment(fExpectObj2._type,
        fExpectObj2._format,
        fExpectObj2._value));
    // @ts-ignore
    path.addSegment(new LogicalSegment(sExpectObj2._type,
        sExpectObj2._format,
        sExpectObj2._value));
    const pathBuffer = path.build();
    expect(pathBuffer).toStrictEqual(bufferPath2);
  });
  test('Build buffer from path with 3 segments', ()=> {
    const path = new Path();
    // @ts-ignore
    path.addSegment(new LogicalSegment(fExpectObj3._type,
        fExpectObj3._format,
        fExpectObj3._value));
    // @ts-ignore
    path.addSegment(new LogicalSegment(sExpectObj3._type,
        sExpectObj3._format,
        sExpectObj3._value));
    // @ts-ignore
    path.addSegment(new LogicalSegment(tExpectObj3._type,
        tExpectObj3._format,
        tExpectObj3._value));

    const pathBuffer = path.build();
    expect(pathBuffer).toStrictEqual(bufferPath3);
  });
});
