import {EPath, Logical} from 'cip/epath';

/* import {LogicalSegment} from 'cip/segment';
import {LogicalFormat} from '../../lib/cip/segment/logical/logical_format';
import {LogicalType} from '../../lib/cip/segment/logical/logical_type';
*/

describe('Test path interface', ()=> {
  const expectedSize2 = 2;
  const fExpectObj2 = {
    segment: 'LOGICAL',
    type: 'CLASS_ID',
    format: 'BIT_8',
    value: 108};
  const sExpectObj2 = {
    segment: 'LOGICAL',
    type: 'ATTRIBUTE_ID',
    format: 'BIT_16',
    value: 37158};

  const listPath2 = [0x20, 0x6c, 0x31, 0x26, 0x91];

  const expectedSize3 = 3;
  const fExpectObj3 = {
    segment: 'LOGICAL',
    type: 'CLASS_ID',
    format: 'BIT_8',
    value: 108};
  const sExpectObj3 = {
    segment: 'LOGICAL',
    type: 'INSTANCE_ID',
    format: 'BIT_8',
    value: 1};
  const tExpectObj3 = {
    segment: 'LOGICAL',
    type: 'ATTRIBUTE_ID',
    format: 'BIT_8',
    value: 4};

  const listPath3 = [0x20, 0x6c, 0x24, 0x01, 0x30, 0x04];

  test('Parse path with 2 segment (8 and 16 bits) ', ()=> {
    const bufferPath2 = Buffer.from(listPath2);
    const path = EPath.parse(bufferPath2);
    expect(path.pathSize).toEqual(expectedSize2);

    const fsegment = path.getSegment(0).toJSON();
    const ssegment = path.getSegment(1).toJSON();

    expect(fsegment).toStrictEqual(fExpectObj2);
    expect(ssegment).toStrictEqual(sExpectObj2);
  });
  /* eslint-disable max-len */
  test('Parse path with 3 segments\n-CLASS SEG\n-INSTANCE SEG\n-ATTRIBUTE SEG', ()=> {
    const bufferPath3 = Buffer.from(listPath3);
    const path = EPath.parse(bufferPath3);
    expect(path.pathSize).toEqual(expectedSize3);

    const fsegment = path.getSegment(0).toJSON();
    const ssegment = path.getSegment(1).toJSON();
    const tsegment = path.getSegment(2).toJSON();

    expect(fsegment).toStrictEqual(fExpectObj3);
    expect(ssegment).toStrictEqual(sExpectObj3);
    expect(tsegment).toStrictEqual(tExpectObj3);
  });
  test('Build buffer from path with 2 segments', ()=> {
    const bufferPath2 = Buffer.from(listPath2);
    const path = new EPath();
    // @ts-ignore
    path.addSegment(new Logical.Segment(Logical.Type.CLASS_ID,
        Logical.Format.BIT_8,
        0x6c));
    // @ts-ignore
    path.addSegment(new Logical.Segment(Logical.Type.ATTRIBUTE_ID,
        Logical.Format.BIT_16,
        37158));
    const pathBuffer = path.encode();
    expect(pathBuffer).toStrictEqual(bufferPath2);
  });
  test('Build buffer from path with 3 segments', ()=> {
    const bufferPath3 = Buffer.from(listPath3);
    const path = new EPath();
    // @ts-ignore
    path.addSegment(new Logical.Segment(Logical.Type.CLASS_ID,
        Logical.Format.BIT_8,
        0x6c));
    // @ts-ignore
    path.addSegment(new Logical.Segment(Logical.Type.INSTANCE_ID,
        Logical.Format.BIT_8,
        1));
    // @ts-ignore
    path.addSegment(new Logical.Segment(Logical.Type.ATTRIBUTE_ID,
        Logical.Format.BIT_8,
        4));

    const pathBuffer = path.encode();
    expect(pathBuffer).toStrictEqual(bufferPath3);
  });
});
