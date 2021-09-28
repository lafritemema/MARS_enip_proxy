import {BufferIterator} from 'utils';

describe('Test BufferIterator class', ()=> {
  test('iterate in a buffer', () => {
    const buffer = Buffer.from([0x50,
      0x40, 0x30,
      0x20, 0x10, 0x00,
      0x00, 0x00,
      0x24, 0x25, 0x26]);
    const bufferIterator = new BufferIterator(buffer);

    // test next method to get next byte
    const firstBufferIt = bufferIterator.next();
    expect(firstBufferIt.value.length).toBe(1);
    expect(firstBufferIt.value.toString('hex')).toBe('50');

    // test next method to get next 3 bytes
    const secondBufferIt = bufferIterator.next(2);
    expect(secondBufferIt.value.length).toBe(2);
    expect(secondBufferIt.value.toString('hex')).toBe('4030');

    // test next method to get next 3 bytes
    const thirdBufferIt = bufferIterator.next(3);
    expect(thirdBufferIt.value.length).toBe(3);
    expect(thirdBufferIt.value.toString('hex')).toBe('201000');

    // test pass method to pass next 2 bytes
    bufferIterator.pass(2);

    // test allNext method to get all next bytes
    const allBufferIt = bufferIterator.allNext();
    expect(allBufferIt.value.length).toBe(3);
    expect(allBufferIt.value.toString('hex')).toBe('242526');

    const nextBufferIt = bufferIterator.next();
    expect(nextBufferIt.value.length).toBe(0);
    expect(nextBufferIt.done).toBe(true);
  });
});
