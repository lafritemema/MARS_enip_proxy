import {BufferIterator} from '../../lib/utils/buffer_iterator';

describe('Test BufferIterator class', ()=> {
  test('iterate in a buffer', () => {
    const buffer = Buffer.from([0x50, 0x40, 0x30, 0x20, 0x10, 0x00]);
    const bufferIterator = new BufferIterator(buffer);

    const firstBufferIt = bufferIterator.next();
    expect(firstBufferIt.value.length).toBe(1);
    expect(firstBufferIt.value.toString('hex')).toBe('50');

    const secondBufferIt = bufferIterator.next(2);
    expect(secondBufferIt.value.length).toBe(2);
    expect(secondBufferIt.value.toString('hex')).toBe('4030');

    const thirdBufferIt = bufferIterator.next(3);
    expect(thirdBufferIt.value.length).toBe(3);
    expect(thirdBufferIt.value.toString('hex')).toBe('201000');

    const nextBufferIt = bufferIterator.next();
    expect(nextBufferIt.value.length).toBe(0);
    expect(nextBufferIt.done).toBe(true);
  });
});
