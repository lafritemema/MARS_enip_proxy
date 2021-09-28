/**
 * Interface describing object
 * returns by the iterator
 */
interface BufferIteratorObject {
  value:Buffer,
  done:boolean,
}

/**
 * Class BuffeIterator
 * Iteration in buffer
 */
export class BufferIterator {
    protected _pbegin:number;
    protected _pend:number;
    protected _buffer:Buffer;

    /**
     * BufferIterator instance constructor
     * @param {Buffer} buffer buffer in which we iterate
     */
    public constructor(buffer:Buffer) {
      this._buffer = buffer;
      this._pend=0;
      this._pbegin=0;
    }

    /**
     * Iteration function to extract element from the buffer
     * @param {number} size number of element to return
     * @return {object} iteration object containing the extracted buffer
     */
    public next(size?:number) : BufferIteratorObject {
      if (this._pend < this._buffer.length) {
        this._pbegin = this._pend;

        if (size) {
          this._pend = this._pbegin + size;
        } else {
          this._pend+=1;
        }
        return {value: this._buffer.slice(this._pbegin, this._pend),
          done: false};
      } else {
        return {value: Buffer.alloc(0),
          done: true};
      }
    }

    /**
     * Iteration function to pass some buffer element
     * usefull when reserved bytes are present in the buffer
     * @param {number} size number of element to pass
     */
    public pass(size?:number):void {
      this._pbegin = size!=undefined ? this._pbegin+size: this._pbegin+1;
      this._pend = size!=undefined ? this._pend+size: this._pend+1;
    }

    /**
     * Iteration function to extract all the remaining elements form the buffer
     * @return {Buffer} iteration object containing the extracted buffer
     */
    public allNext() {
      if (this._pend < this._buffer.length) {
        this._pbegin = this._pend;

        this._pend = this._buffer.length;

        return {value: this._buffer.slice(this._pbegin, this._pend),
          done: false};
      } else {
        return {value: Buffer.alloc(0),
          done: true};
      }
    }
}
