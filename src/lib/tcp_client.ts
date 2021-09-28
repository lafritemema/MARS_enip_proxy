import {Socket} from 'net';
import {Enip} from './enip/enip';

const client = new Socket();
client.connect(44818, '127.0.0.2', ()=> {
  console.log('connected');
  // const enipRegSessionReq = Enip.buildRegisterSessionReq();
  // client.write(enipRegSessionReq.encode());

  /* const strBuff = Buffer.from('lulu');
  const countBuff = Buffer.alloc(4);
  countBuff.writeUInt32LE(strBuff.length);
  const restBuffer = Buffer.alloc(82-strBuff.length);
  const paddingBuff =Buffer.alloc(2);
  const totBuff = Buffer.concat([countBuff, strBuff, restBuffer, paddingBuff]);
  */
  const buffPRJNT = Buffer.alloc(40);
  buffPRJNT.writeInt8(0, 0); // write user tool
  buffPRJNT.writeInt8(0, 1); // write user frame
  // reserved 2 next bytes
  buffPRJNT.writeFloatLE(0.0, 4); // J1
  buffPRJNT.writeFloatLE(18.5, 8); // J2
  buffPRJNT.writeFloatLE(-39.0, 12); // J3
  buffPRJNT.writeFloatLE(0.0, 16); // J4
  buffPRJNT.writeFloatLE(106.0, 20); // J5
  buffPRJNT.writeFloatLE(90.0, 24); // J6
  buffPRJNT.writeFloatLE(512.0, 28); // E1
  buffPRJNT.writeFloatLE(0.0, 32); // 8
  buffPRJNT.writeFloatLE(0.0, 36); // 8
  const enip = Enip.buildSendRRDataReq(buffPRJNT);
  client.write(enip.encode());
});

client.on('data', (data)=> {
  const enip = Enip.parse(data);
  const enipObj = enip.toJSON();
  console.log(JSON.stringify(enipObj));

  // @ts-ignore
  // eslint-disable-next-line max-len
  const dataBuff:Buffer = Buffer.from(<string>enipObj.enipData.enipCpf.dataItem.data.data, 'hex');
  const ut = dataBuff.readInt8(0);
  const uf = dataBuff.readInt8(1);
  const j1 = dataBuff.readFloatLE(4);
  const j2 = dataBuff.readFloatLE(8);
  const j3 = dataBuff.readFloatLE(12);
  const j4 = dataBuff.readFloatLE(16);
  const j5 = dataBuff.readFloatLE(20);
  const j6 = dataBuff.readFloatLE(24);
  const e1 = dataBuff.readFloatLE(28);

  console.log(`j1:${j1}, j2:${j2},j3:${j3}, j4:${j4}, j5:${j5}, j6:${j6}, e1:${e1}`);
  
  // console.log(dataBuff);
  // console.log(dataBuff.readFloatLE());
  client.destroy();
});
