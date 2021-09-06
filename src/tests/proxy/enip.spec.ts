import {Socket} from 'net';
import {EnipHeader} from '../../lib/enip/encapsulation/header/enip_header';

const client = new Socket();
client.connect(44818, '172.0.0.2', ()=> {
  const header = EnipHeader.buildRegSessionHeader();
  client.write(header.encode());
});

client.on('data', (data)=> {
  console.log(data);
  client.destroy();
});
