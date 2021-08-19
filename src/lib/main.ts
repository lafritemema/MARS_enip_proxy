
// import { CPF } from "./enip"
import {Path} from './cip/path.js';
// eslint-disable-next-line spaced-comment

import * as SEGMENT from './cip/segment';

/*
interface DataItem{
    typeId : string,
    dataBuf : Buffer
}

let databuf = Buffer.alloc(2);
databuf.writeInt16LE(1);

let dilist:DataItem[] = [
                        {typeId:'Null', dataBuf:Buffer.alloc(2,0)},
                        {typeId:'UCMM', dataBuf:databuf}
                    ]

let buf:Buffer = CPF.build(dilist)
console.log(buf.length)

console.log(buf);
*/

