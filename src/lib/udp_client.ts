
import * as udp from 'dgram';
import {Enip} from './enip/enip';

const client = udp.createSocket('udp4');

const listIdentity = Enip.buildListIdentityReq();

client.on('message', (msg, info)=> {
  const enip = Enip.parse(msg);
  console.log(JSON.stringify(enip.toJSON()));
  client.close();
});

client.send(listIdentity.encode(),
    44818,
    '127.255.255.255',
    (error)=> {
      if (error) {
        console.log(error);
        client.close();
      }
    });
