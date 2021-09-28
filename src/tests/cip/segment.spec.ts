import * as cip from 'cip';
import {BufferIterator} from 'utils';
const Logical = cip.epath.segment.Logical;
const logical = cip.epath.segment.logical;

describe('Test segment interface', ()=> {
  // object and buffer describing a class logical segment format BIT_8
  const class8bitObj = {
    segment: 'LOGICAL',
    type: 'CLASS_ID',
    format: 'BIT_8',
    value: 108};
  const class8bitBuff = Buffer.from([0x20, 0x6c]);

  // object and buffer describing a attribute logical segment format BIT_16
  const attribute16bitObj = {
    segment: 'LOGICAL',
    type: 'ATTRIBUTE_ID',
    format: 'BIT_16',
    value: 37158};
  const attribute16bitBuffer = Buffer.from([0x31, 0x00, 0x26, 0x91]);

  // object and buffer describing a CONNECTION_POINT logical segment format BIT_32
  const conn32bitObj = {
    segment: 'LOGICAL',
    type: 'CONNECTION_POINT',
    format: 'BIT_32',
    value: 639996198};
  const conn32bitBuff = Buffer.from([0x2E, 0x00, 0x26, 0x91, 0x25, 0x26]);

  // buffer containing the 3 previous buffer
  const buffer = Buffer.concat([
    class8bitBuff,
    attribute16bitBuffer,
    conn32bitBuff]);

  test('Encode a logical segment with 8 bit value size', ()=>{
    const segment = new Logical(logical.Type.CLASS_ID,
        logical.Format.BIT_8,
        0x6c);
    const buffer = segment.encode();
    expect(buffer).toStrictEqual(class8bitBuff);
  });
  test('Encode a logical segment with 16 bit value size', ()=>{
    // @ts-ignore
    const segment = new Logical(logical.Type.ATTRIBUTE_ID,
        logical.Format.BIT_16,
        37158);
    const buffer = segment.encode();
    expect(buffer).toStrictEqual(attribute16bitBuffer);
  });
  test('Encode a logical segment with 32 bit value size', ()=>{
    // @ts-ignore
    const segment = new Logical(logical.Type.CONNECTION_POINT,
        logical.Format.BIT_32,
        639996198);
    const buffer = segment.encode();
    expect(buffer).toStrictEqual(conn32bitBuff);
  });

  test('Parse the buffer to extract the 3 segments', ()=>{
    // instanciate a buffer iterator
    const buffIt = new BufferIterator(buffer);
    // instanciate a segment iterator with buffer iterator and number of segments as parameters
    const segmentIterator = new cip.epath.segment.Iterator(buffIt, 3);

    const class8bitSeg = <cip.epath.Segment>segmentIterator.next().value;
    const attribute16bitSeg = <cip.epath.Segment>segmentIterator.next().value;
    const conn32bitseg = <cip.epath.Segment>segmentIterator.next().value;

    expect(class8bitSeg.toJSON()).toStrictEqual(class8bitObj);
    expect(attribute16bitSeg.toJSON()).toStrictEqual(attribute16bitObj);
    expect(conn32bitseg.toJSON()).toStrictEqual(conn32bitObj);
  });
});
