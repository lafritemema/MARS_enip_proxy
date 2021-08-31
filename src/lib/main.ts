import {Socket} from 'net';
import {Enip} from './enip/enip';

const client = new Socket();
client.connect(44818, '127.0.0.2', ()=> {
  console.log('connected');
  const enipRegSessionReq = Enip.buildRegisterSessionReq();
  client.write(enipRegSessionReq.encode());
});

client.on('data', (data)=> {
  const enip = Enip.parse(data);
  console.log(enip.toJSON());
  client.destroy();
});
