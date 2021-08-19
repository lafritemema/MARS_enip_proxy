// import {SegmentFactory} from './segments/segment_factory';
// import {Segment} from './segments/segment';

import * as SEGMENT from './segment';

/**
 * @class EPath
 */
export class EPath {
  private _segmentList:SEGMENT.Segment[];

  /**
   * @constructor
   * @param {Segment[]} segments list of segments contained in the path
   */
  public constructor(segments:SEGMENT.Segment[]=[]) {
    this._segmentList=segments;
  }

  /**
   * Parse the buffer describing the Epath
   * @param {Buffer} pathBuffer : hex buffer to parse
   * @return {Path} EPath instance
   */
  public static parse(pathBuffer:Buffer): EPath {
    // get only the 3 higher bits describing the segment to get the segment type
    // to obtain the type code

    const segments : SEGMENT.Segment[] = [];
    let cursor:number = 0;

    while (cursor < pathBuffer.length) {
      // segment.parseMeta(pathBuffer.slice(cursor, cursor+1));
      // eslint-disable-next-line max-len
      const typedSegment:SEGMENT.Segment = SEGMENT.parseMeta(pathBuffer.slice(cursor, cursor+1));
      const dataBuffer = pathBuffer.slice(
          cursor + 1,
          cursor + typedSegment.dataLength + 1,
      );

      typedSegment.parseData(dataBuffer);

      segments.push(typedSegment);
      cursor += typedSegment.dataLength+1;
    }

    return new EPath(segments);
  }

  /**
   * Get the EPath length in byte
   * @return {number} epath length in byte
   */
  public get lenght() : number {
    let length = 0;

    for (const s of this._segmentList) {
      length+=s.length;
    }
    return length;
  }

  /**
   * Get the number of segments contained in the EPath
   * @return {number} number of segments
   */
  public get pathSize(): number {
    return this._segmentList.length;
  }

  /**
   * Get the list of segments
   * @return {Segment[]} list of segment
   */
  // public getAllSegments() : SEGMENT.Segment[] {
  //  return this._segmentList;
  // }

  /**
   * Get the segment at a specified index in the EPath
   * @param {number} index segment index
   * @return {Segment} the segment at the specified index
   */
  public getSegment(index:number):SEGMENT.Segment {
    return this._segmentList[index];
  }

  /**
   * Add one or several segments in the path
   * @param {Segment|Segment[]} segment segment to add
   */
  public addSegment(segment:SEGMENT.Segment|SEGMENT.Segment[]):void {
    if (segment instanceof SEGMENT.Segment) {
      this._segmentList.push(segment);
    } else {
      this._segmentList.concat(segment);
    }
  }

  /**
   * Build a buffer describing the path
   * @return {Buffer} A buffer describing the path
   */
  public encode():Buffer {
    const bufferList = [];

    bufferList.push(Buffer.from([this._segmentList.length]));

    for (const s of this._segmentList) {
      bufferList.push(s.encode());
    }

    return Buffer.concat(bufferList);
  }
  /**
   * Convert the epath instance to JSON
   * @return {object} the JSON representation
   */
  public toJSON():object {
    return this._segmentList.map((s)=>s.toJSON());
  }
}
