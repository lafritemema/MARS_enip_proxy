import {DataHandler, HandledData} from '../enip/data_handler';
import {EnipRequestData} from './config_interfaces';
import {BufferIterator} from 'utils';
import {DataHanlderError} from '../proxy_error';

/**
 * Class describing a fanuc data handler
 */
export class FanucDataHandler extends DataHandler {
  /**
   * Encode data to a Buffer
   * @param {object} data object describing the data
   * @return {Buffer} datagram describing the data valu
   */
  public encode(data:EnipRequestData):Buffer {
    let buffer:Buffer;
    const type = data.type == 'array'? data.items?.type: data.type;
    switch (type) {
      case 'INT':
      case 'REAL':
        const num = data.type == 'array'?
          (<MultipleNumRegData>data.value).values:
          (<SingleNumRegData>data.value).value;

        buffer = numberToBuffer(num, type);
        break;
      case 'STRING':
        const text = data.type == 'array'?
          (<MultipleStringRegData>data.value).texts:
          (<SingleStringRegData>data.value).text;

        buffer = stringToBuffer(text);
        break;
      case 'JNT_POSITION':
        try {
          const jntPosData = data.type == 'array'?
            (<MultiplePosRegData>data.value).positions:
            (<SinglePosRegData>data.value).position;

          buffer = jntPosToBuffer(jntPosData);
        } catch (error) {
          // eslint-disable-next-line max-len
          throw new DataHanlderError('ERROR: Error on joint position encoding :\n'+(<Error>error).message);
        }
        break;
      case 'CRT_POSITION':
        try {
          const crtPosData = data.type == 'array'?
            (<MultiplePosRegData>data.value).positions:
            (<SinglePosRegData>data.value).position;

          buffer = crtPosToBuffer(crtPosData);
        } catch (error) {
          // eslint-disable-next-line max-len
          throw new DataHanlderError('ERROR: Error on cartesian position encoding :\n'+(<Error>error).message);
        }
        break;
      default:
        throw new Error(`The data type <${type}> encoding \
        is not implemented yet`);
    }

    return buffer;
  }

  /**
   * parse a buffer to extract data accroding type
   * @param {Buffer} dataBuffer datagram describing the data
   * @param {string} type type of data
   * @return {HandledData} an object describing the data
   */
  public parse(dataBuffer:Buffer, type:string):HandledData {
    const hdata:HandledData={};
    console.log(type);
    switch (type) {
      case 'INT':
      case 'REAL':
        const numData = bufferToNumber(dataBuffer, type);
        if (Array.isArray(numData)) {
          (<MultipleNumRegData>hdata).values = numData;
        } else {
          (<SingleNumRegData>hdata).value = numData;
        }
        break;
      case 'STRING':
        const strData = bufferToString(dataBuffer);
        if (Array.isArray(strData)) {
          (<MultipleStringRegData>hdata).texts = strData;
        } else {
          (<SingleStringRegData>hdata).text = strData;
        }
        break;
      case 'CRT_POSITION':
        const crtPosData = bufferToCrtPos(dataBuffer);
        if (Array.isArray(crtPosData)) {
          (<MultiplePosRegData>hdata).positions = crtPosData;
        } else {
          (<SinglePosRegData>hdata).position = crtPosData;
        }
        break;
      case 'JNT_POSITION':
        const jntPosData = bufferToJntPos(dataBuffer);
        if (Array.isArray(jntPosData)) {
          (<MultiplePosRegData>hdata).positions = jntPosData;
        } else {
          (<SinglePosRegData>hdata).position = jntPosData;
        }
        break;
      default:
        throw new Error(`The data type <${type}> parsing \
        is not implemented yet`);
    }

    return hdata;
  }
}

/**
 * encode number or number array to a datagram according the type
 * @param {number|number[]} num number or array of number to encode
 * @param {string} type number type , 'INT' or 'REAL'
 * @return {Buffer} encoded data
 */
function numberToBuffer(num:number|number[], type:'INT'|'REAL'): Buffer {
  const writeFct:()=>void = type =='REAL' ?
      Buffer.prototype.writeFloatLE :
      Buffer.prototype.writeInt32LE;

  if (Array.isArray(num)) {
    const buff = [];
    for (const n of num) {
      const tbuff = Buffer.alloc(4);
      // @ts-ignore
      writeFct.call(tbuff, n);
      buff.push(tbuff);
    }
    return Buffer.concat(buff);
  } else {
    const buff = Buffer.alloc(4);
    // @ts-ignore
    writeFct.call(buff, num);
    return buff;
  }
}

/**
 * parse datagram to extract number information
 * @param {Buffer} numBuffer buffer to parse
 * @param {string} type number type , 'INT' or 'REAL'
 * @return {number|number[]} number or array of number extracted
 */
function bufferToNumber(numBuffer:Buffer, type:'INT'|'REAL'):number|number[] {
  const readFct:()=>number = type == 'REAL' ?
      Buffer.prototype.readFloatLE :
      Buffer.prototype.readInt32LE;

  if (numBuffer.length > 4) {
    const numArray:number[] = [];
    const buffIterator = new BufferIterator(numBuffer);
    let buffIteration = buffIterator.next(4);
    while (!buffIteration.done) {
      const num = readFct.call(buffIteration.value);
      numArray.push(num);
      buffIteration = buffIterator.next(4);
    }
    return numArray;
  } else {
    // @ts-ignore
    const num = readFct.call(numBuffer);
    return num;
  }
}

/**
 * encode a text in specific fanuc datagram
 * @param {string} text text to encode
 * @return {Buffer} datagram describing the text
 */
function stringToBuffer(text:string|string[]) {
  if (Array.isArray(text)) {
    const buff = [];
    for (const t of text) {
      const tbuff = Buffer.alloc(88); // 88 bytes for string
      tbuff.writeUInt32LE(t.length, 0); // 4 firt bytes for length
      tbuff.write(t, 4); // write text in the next bytes
      buff.push(tbuff);
    }
    return Buffer.concat(buff);
  } else {
    const buffer = Buffer.alloc(88);
    buffer.writeUInt32LE(text.length, 0);
    buffer.write(text, 4);
    return buffer;
  }
}

/**
 * parse datagram to extract string informations
 * @param {Buffer} stringBuffer buffer to parse
 * @return {string|string[]} string or array of string
 */
function bufferToString(stringBuffer:Buffer):string|string[] {
  if (stringBuffer.length > 88) {
    const stringArray:string[] = [];
    const buffIterator = new BufferIterator(stringBuffer);
    let buffIteration = buffIterator.next(88);
    while (!buffIteration.done) {
      const tstrbuff = buffIteration.value;
      const strLength = tstrbuff.readUInt32LE(0); // first 4 bytes => lenght of string

      const text = tstrbuff.slice(4, 4+strLength).toString('utf-8'); // next text info

      stringArray.push(text);

      buffIteration = buffIterator.next(88);
    }
    return stringArray;
  } else {
    const strLength = stringBuffer.readUInt32LE(0); // first 4 bytes => lenght of string
    const text = stringBuffer.slice(4, 4+strLength).toString('utf-8'); // next text info
    return text;
  }
}

/**
 * encode a JNT type position to specific fanuc datagram
 * @param {PointPosition|PointPosition[]} posData object describing the JNT point
 * @return {Buffer} a datagram describing the JNT position
 */
function jntPosToBuffer(posData:PointPosition|PointPosition[]):Buffer {
  if (Array.isArray(posData)) {
    const buff = [];
    for (const p of posData) {
      const tbuff = encodeJntPosition(p);
      buff.push(tbuff);
    }
    return Buffer.concat(buff);
  } else {
    return encodeJntPosition(posData);
  }
}

/**
 * parse datagram to extract jnt positions informations
 * @param {Buffer} jntBuffer buffer describing jnt positions
 * @return {PointPosition} object describing jnt point position
 */
function bufferToJntPos(jntBuffer:Buffer):PointPosition|PointPosition[] {
  if (jntBuffer.length > 40) {
    const jntPosArray:PointPosition[] = [];
    const buffIterator = new BufferIterator(jntBuffer);
    let buffIteration = buffIterator.next(40);

    while (!buffIteration.done) {
      jntPosArray.push(parseJntPosition(buffIteration.value));
      buffIteration = buffIterator.next(40);
    }
    return jntPosArray;
  } else {
    return parseJntPosition(jntBuffer);
  }
}

/**
 * encode a CRT type position to specific fanuc datagram
 * @param {PointPosition|PointPosition[]} dataPos object describing the JNT point
 * @return {Buffer} a datagram describing the JNT position
 */
function crtPosToBuffer(dataPos:PointPosition|PointPosition[]) {
  if (Array.isArray(dataPos)) {
    const buff = [];
    for (const p of dataPos) {
      const tbuff = encodeCrtPosition(p);
      buff.push(tbuff);
    }
    return Buffer.concat(buff);
  } else {
    return encodeCrtPosition(dataPos);
  }
}

/**
 * parse a buffer to extract crt positions information
 * @param {Buffer} crtBuffer buffer describing crt positions
 * @return {PointPosition|PointPosition[]} object describing crt point position
 */
function bufferToCrtPos(crtBuffer:Buffer) : PointPosition|PointPosition[] {
  if (crtBuffer.length > 44) {
    const crtPosArray:PointPosition[] = [];
    const buffIterator = new BufferIterator(crtBuffer);
    let buffIteration = buffIterator.next(44);

    while (!buffIteration.done) {
      crtPosArray.push(parseCrtPosition(buffIteration.value));
      buffIteration = buffIterator.next(44);
    }
    return crtPosArray;
  } else {
    return parseCrtPosition(crtBuffer);
  }
}

/**
 * Encode a single Crt position
 * @param {PointPosition} position crt position object
 * @return {Buffer} datagram describing crt position
 */
function encodeCrtPosition(position:PointPosition) {
  const tbuff = Buffer.alloc(44);
  tbuff.writeInt8(position.ut, 0); // user tool
  tbuff.writeInt8(position.ut, 1); // user frame
  // 2 bytes reserved

  // write vector
  const vector = <CrtPosVector>position.vector;
  tbuff.writeFloatLE(vector.x, 4);
  tbuff.writeFloatLE(vector.y, 8);
  tbuff.writeFloatLE(vector.z, 12);
  tbuff.writeFloatLE(vector.w, 16);
  tbuff.writeFloatLE(vector.p, 20);
  tbuff.writeFloatLE(vector.r, 24);

  // write config
  const config = <CrtPosConfig>position.config;
  tbuff.writeInt8(config.j4, 28);
  tbuff.writeInt8(config.j5, 29);
  tbuff.writeInt8(config.j6, 30);

  // arm config +  reserved 4 bits
  const front = config.arm == 'TOWARD' ? 1<<4 : 0;
  const up = config.forearm == 'UP' ? 1<<5 :0;
  const left = 0; // not implemented yed so 0 but 1<<6 if needed
  const flip = config.wrist == 'FLIP' ? 1<<7 : 0;

  const armConfig = front | up | left | flip;
  tbuff.writeUInt8(armConfig, 31);

  // external axes
  tbuff.writeFloatLE(position.e1, 32); // write e1
  tbuff.writeFloatLE(0, 36); // not implemented
  tbuff.writeFloatLE(0, 40); // not implemented

  return tbuff;
}

/**
 * parse datagram to extract one crt position informations
 * @param {Buffer} crtBuffer datagram describing crt position
 * @return {PointPosition} object describing CRT position
 */
function parseCrtPosition(crtBuffer:Buffer):PointPosition {
  const buffIt = new BufferIterator(crtBuffer);
  const ut = buffIt.next().value.readInt8();
  const uf = buffIt.next().value.readInt8();
  buffIt.pass(2); // pass 2 reserved value
  const x = buffIt.next(4).value.readFloatLE();
  const y = buffIt.next(4).value.readFloatLE();
  const z = buffIt.next(4).value.readFloatLE();
  const w = buffIt.next(4).value.readFloatLE();
  const p = buffIt.next(4).value.readFloatLE();
  const r = buffIt.next(4).value.readFloatLE();

  const j4 = buffIt.next().value.readInt8();
  const j5 = buffIt.next().value.readInt8();
  const j6 = buffIt.next().value.readInt8();

  const armConfig = buffIt.next().value.readUInt8();
  const front = (armConfig & 1<<4) ? 'TOWARD' : 'BACKWARD'; // filter bit front
  const up = armConfig & 1<<5 ? 'UP': 'DOWN'; // filter bit up
  // const left ... not implemented yet but filter 1<<6 if needed
  const flip = armConfig & 1<<7 ? 'FLIP' : 'NOFLIP';

  const e1 = buffIt.next(4).value.readFloatLE();

  const crtConfig:CrtPosConfig = {
    arm: front,
    forearm: up,
    wrist: flip,
    j4: j4,
    j5: j5,
    j6: j6,
  };

  const crtVector:CrtPosVector = {
    x: x,
    y: y,
    z: z,
    w: w,
    r: r,
    p: p,
  };

  return {
    e1: e1,
    config: crtConfig,
    vector: crtVector,
    uf: uf,
    ut: ut,
    type: 'CARTESIAN',
  };
}

/**
 * Encode a single jnt position
 * @param {PointPosition} position jnt position object
 * @return {Buffer} datagram describing jnt position
 */
function encodeJntPosition(position:PointPosition) {
  const tbuff = Buffer.alloc(40); // 40 bytes for jnt point buffer
  tbuff.writeInt8(position.ut, 0); // write user tool
  tbuff.writeInt8(position.uf, 1);
  // two bytes reserved

  const vector = <JntPosVector>position.vector;
  tbuff.writeFloatLE(vector.j1, 4); // J1
  tbuff.writeFloatLE(vector.j2, 8); // J2
  tbuff.writeFloatLE(vector.j3, 12); // J3
  tbuff.writeFloatLE(vector.j4, 16); // J4
  tbuff.writeFloatLE(vector.j5, 20); // J5
  tbuff.writeFloatLE(vector.j6, 24); // J6

  tbuff.writeFloatLE(position.e1, 28); // write E1
  tbuff.writeFloatLE(0.0, 32); // 8
  tbuff.writeFloatLE(0.0, 36); // 8

  return tbuff;
}

/**
 * parse datagram to extract one jnt position informations
 * @param {Buffer} jntBuffer datagram describing crt position
 * @return {PointPosition} object describing CRT position
 */
function parseJntPosition(jntBuffer:Buffer):PointPosition {
  const buffIt = new BufferIterator(jntBuffer);

  // read user frame and user tool
  const ut = buffIt.next().value.readInt8();
  const uf = buffIt.next().value.readInt8();
  buffIt.pass(2); // 2 bytes reserved

  // read vector
  const j1 = buffIt.next(4).value.readFloatLE();
  const j2 = buffIt.next(4).value.readFloatLE();
  const j3 = buffIt.next(4).value.readFloatLE();
  const j4 = buffIt.next(4).value.readFloatLE();
  const j5 = buffIt.next(4).value.readFloatLE();
  const j6 = buffIt.next(4).value.readFloatLE();
  const vector:JntPosVector = {j1: j1, j2: j2, j3: j3, j4: j4, j5: j5, j6: j6};

  // read e1
  const e1 = buffIt.next(4).value.readFloatLE();
  // 2 next external axes not used

  return {
    e1: e1,
    vector: vector,
    ut: ut,
    uf: uf,
    type: 'JOINT',
  };
}

interface SingleNumRegData extends HandledData {
  value:number
};
interface MultipleNumRegData extends HandledData {
  values:number[]
};
interface SingleStringRegData extends HandledData {
  text:string
};
interface MultipleStringRegData extends HandledData {
  texts:string[]
};
interface SinglePosRegData extends HandledData {
  position:PointPosition
};
interface MultiplePosRegData extends HandledData {
  positions:PointPosition[]
};
interface JntPosVector {
  j1:number,
  j2:number,
  j3:number,
  j4:number,
  j5:number,
  j6:number
};
interface CrtPosVector {
  p:number,
  r:number,
  w:number,
  x:number,
  y:number,
  z:number
};
interface CrtPosConfig {
  arm:'TOWARD'|'BACKWARD',
  forearm: 'UP'|'DOWN',
  wrist: 'FLIP'|'NOFLIP',
  j4:number,
  j5:number,
  j6:number
}
interface PointPosition {
  e1:number,
  type:'CARTESIAN'|'JOINT',
  vector:CrtPosVector|JntPosVector,
  config?:CrtPosConfig,
  ut:number,
  uf:number,
}


