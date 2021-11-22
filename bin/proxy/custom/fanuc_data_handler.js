"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FanucDataHandler = void 0;
const data_handler_1 = require("../enip/data_handler");
const utils_1 = require("../../utils");
const proxy_error_1 = require("../proxy_error");
/**
 * Class describing a fanuc data handler
 */
class FanucDataHandler extends data_handler_1.DataHandler {
    /**
     * Encode data to a Buffer
     * @param {object} data object describing the data
     * @return {Buffer} datagram describing the data valu
     */
    encode(data) {
        var _a;
        let buffer;
        const type = data.type == 'array' ? (_a = data.items) === null || _a === void 0 ? void 0 : _a.type : data.type;
        switch (type) {
            case 'INT':
            case 'REAL':
                const num = data.type == 'array' ?
                    data.value.values :
                    data.value.value;
                buffer = numberToBuffer(num, type);
                break;
            case 'STRING':
                const text = data.type == 'array' ?
                    data.value.texts :
                    data.value.text;
                buffer = stringToBuffer(text);
                break;
            case 'JNT_POSITION':
                try {
                    const jntPosData = data.type == 'array' ?
                        data.value.positions :
                        data.value.position;
                    buffer = jntPosToBuffer(jntPosData);
                }
                catch (error) {
                    // eslint-disable-next-line max-len
                    throw new proxy_error_1.DataHanlderError('ERROR: Error on joint position encoding :\n' + error.message);
                }
                break;
            case 'CRT_POSITION':
                try {
                    const crtPosData = data.type == 'array' ?
                        data.value.positions :
                        data.value.position;
                    buffer = crtPosToBuffer(crtPosData);
                }
                catch (error) {
                    // eslint-disable-next-line max-len
                    throw new proxy_error_1.DataHanlderError('ERROR: Error on cartesian position encoding :\n' + error.message);
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
    parse(dataBuffer, type) {
        const hdata = {};
        console.log(type);
        switch (type) {
            case 'INT':
            case 'REAL':
                const numData = bufferToNumber(dataBuffer, type);
                if (Array.isArray(numData)) {
                    hdata.values = numData;
                }
                else {
                    hdata.value = numData;
                }
                break;
            case 'STRING':
                const strData = bufferToString(dataBuffer);
                if (Array.isArray(strData)) {
                    hdata.texts = strData;
                }
                else {
                    hdata.text = strData;
                }
                break;
            case 'CRT_POSITION':
                const crtPosData = bufferToCrtPos(dataBuffer);
                if (Array.isArray(crtPosData)) {
                    hdata.positions = crtPosData;
                }
                else {
                    hdata.position = crtPosData;
                }
                break;
            case 'JNT_POSITION':
                const jntPosData = bufferToJntPos(dataBuffer);
                if (Array.isArray(jntPosData)) {
                    hdata.positions = jntPosData;
                }
                else {
                    hdata.position = jntPosData;
                }
                break;
            default:
                throw new Error(`The data type <${type}> parsing \
        is not implemented yet`);
        }
        return hdata;
    }
}
exports.FanucDataHandler = FanucDataHandler;
/**
 * encode number or number array to a datagram according the type
 * @param {number|number[]} num number or array of number to encode
 * @param {string} type number type , 'INT' or 'REAL'
 * @return {Buffer} encoded data
 */
function numberToBuffer(num, type) {
    const writeFct = type == 'REAL' ?
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
    }
    else {
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
function bufferToNumber(numBuffer, type) {
    const readFct = type == 'REAL' ?
        Buffer.prototype.readFloatLE :
        Buffer.prototype.readInt32LE;
    if (numBuffer.length > 4) {
        const numArray = [];
        const buffIterator = new utils_1.BufferIterator(numBuffer);
        let buffIteration = buffIterator.next(4);
        while (!buffIteration.done) {
            const num = readFct.call(buffIteration.value);
            numArray.push(num);
            buffIteration = buffIterator.next(4);
        }
        return numArray;
    }
    else {
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
function stringToBuffer(text) {
    if (Array.isArray(text)) {
        const buff = [];
        for (const t of text) {
            const tbuff = Buffer.alloc(88); // 88 bytes for string
            tbuff.writeUInt32LE(t.length, 0); // 4 firt bytes for length
            tbuff.write(t, 4); // write text in the next bytes
            buff.push(tbuff);
        }
        return Buffer.concat(buff);
    }
    else {
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
function bufferToString(stringBuffer) {
    if (stringBuffer.length > 88) {
        const stringArray = [];
        const buffIterator = new utils_1.BufferIterator(stringBuffer);
        let buffIteration = buffIterator.next(88);
        while (!buffIteration.done) {
            const tstrbuff = buffIteration.value;
            const strLength = tstrbuff.readUInt32LE(0); // first 4 bytes => lenght of string
            const text = tstrbuff.slice(4, 4 + strLength).toString('utf-8'); // next text info
            stringArray.push(text);
            buffIteration = buffIterator.next(88);
        }
        return stringArray;
    }
    else {
        const strLength = stringBuffer.readUInt32LE(0); // first 4 bytes => lenght of string
        const text = stringBuffer.slice(4, 4 + strLength).toString('utf-8'); // next text info
        return text;
    }
}
/**
 * encode a JNT type position to specific fanuc datagram
 * @param {PointPosition|PointPosition[]} posData object describing the JNT point
 * @return {Buffer} a datagram describing the JNT position
 */
function jntPosToBuffer(posData) {
    if (Array.isArray(posData)) {
        const buff = [];
        for (const p of posData) {
            const tbuff = encodeJntPosition(p);
            buff.push(tbuff);
        }
        return Buffer.concat(buff);
    }
    else {
        return encodeJntPosition(posData);
    }
}
/**
 * parse datagram to extract jnt positions informations
 * @param {Buffer} jntBuffer buffer describing jnt positions
 * @return {PointPosition} object describing jnt point position
 */
function bufferToJntPos(jntBuffer) {
    if (jntBuffer.length > 40) {
        const jntPosArray = [];
        const buffIterator = new utils_1.BufferIterator(jntBuffer);
        let buffIteration = buffIterator.next(40);
        while (!buffIteration.done) {
            jntPosArray.push(parseJntPosition(buffIteration.value));
            buffIteration = buffIterator.next(40);
        }
        return jntPosArray;
    }
    else {
        return parseJntPosition(jntBuffer);
    }
}
/**
 * encode a CRT type position to specific fanuc datagram
 * @param {PointPosition|PointPosition[]} dataPos object describing the JNT point
 * @return {Buffer} a datagram describing the JNT position
 */
function crtPosToBuffer(dataPos) {
    if (Array.isArray(dataPos)) {
        const buff = [];
        for (const p of dataPos) {
            const tbuff = encodeCrtPosition(p);
            buff.push(tbuff);
        }
        return Buffer.concat(buff);
    }
    else {
        return encodeCrtPosition(dataPos);
    }
}
/**
 * parse a buffer to extract crt positions information
 * @param {Buffer} crtBuffer buffer describing crt positions
 * @return {PointPosition|PointPosition[]} object describing crt point position
 */
function bufferToCrtPos(crtBuffer) {
    if (crtBuffer.length > 44) {
        const crtPosArray = [];
        const buffIterator = new utils_1.BufferIterator(crtBuffer);
        let buffIteration = buffIterator.next(44);
        while (!buffIteration.done) {
            crtPosArray.push(parseCrtPosition(buffIteration.value));
            buffIteration = buffIterator.next(44);
        }
        return crtPosArray;
    }
    else {
        return parseCrtPosition(crtBuffer);
    }
}
/**
 * Encode a single Crt position
 * @param {PointPosition} position crt position object
 * @return {Buffer} datagram describing crt position
 */
function encodeCrtPosition(position) {
    const tbuff = Buffer.alloc(44);
    tbuff.writeInt8(position.ut, 0); // user tool
    tbuff.writeInt8(position.ut, 1); // user frame
    // 2 bytes reserved
    // write vector
    const vector = position.vector;
    tbuff.writeFloatLE(vector.x, 4);
    tbuff.writeFloatLE(vector.y, 8);
    tbuff.writeFloatLE(vector.z, 12);
    tbuff.writeFloatLE(vector.w, 16);
    tbuff.writeFloatLE(vector.p, 20);
    tbuff.writeFloatLE(vector.r, 24);
    // write config
    const config = position.config;
    tbuff.writeInt8(config.j4, 28);
    tbuff.writeInt8(config.j5, 29);
    tbuff.writeInt8(config.j6, 30);
    // arm config +  reserved 4 bits
    const front = config.arm == 'TOWARD' ? 1 << 4 : 0;
    const up = config.forearm == 'UP' ? 1 << 5 : 0;
    const left = 0; // not implemented yed so 0 but 1<<6 if needed
    const flip = config.wrist == 'FLIP' ? 1 << 7 : 0;
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
function parseCrtPosition(crtBuffer) {
    const buffIt = new utils_1.BufferIterator(crtBuffer);
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
    const front = (armConfig & 1 << 4) ? 'TOWARD' : 'BACKWARD'; // filter bit front
    const up = armConfig & 1 << 5 ? 'UP' : 'DOWN'; // filter bit up
    // const left ... not implemented yet but filter 1<<6 if needed
    const flip = armConfig & 1 << 7 ? 'FLIP' : 'NOFLIP';
    const e1 = buffIt.next(4).value.readFloatLE();
    const crtConfig = {
        arm: front,
        forearm: up,
        wrist: flip,
        j4: j4,
        j5: j5,
        j6: j6,
    };
    const crtVector = {
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
function encodeJntPosition(position) {
    const tbuff = Buffer.alloc(40); // 40 bytes for jnt point buffer
    tbuff.writeInt8(position.ut, 0); // write user tool
    tbuff.writeInt8(position.uf, 1);
    // two bytes reserved
    const vector = position.vector;
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
function parseJntPosition(jntBuffer) {
    const buffIt = new utils_1.BufferIterator(jntBuffer);
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
    const vector = { j1: j1, j2: j2, j3: j3, j4: j4, j5: j5, j6: j6 };
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
;
;
;
;
;
;
;
;
