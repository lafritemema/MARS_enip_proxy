// eslint-disable-next-line max-len
import * as enip from 'enip';
import * as cip from 'cip';

const Identity = cip.Identity;
const device = cip.identity.device;

describe('Parse/Encode an list identity encapsulated data response', ()=> {
  // eslint-disable-next-line max-len
  const listIdentityItemHexStr = '01000c00340001000200af12c0a80149000000000000000064010c0004000301340021d720f41246414e554320526f626f742052333069422bff';

  const identityObj = {
    vendorId: 356,
    vendorName: 'Fanuc Robotics America',
    deviceType: 'Communications Adapter',
    productCode: 4,
    revision: '3.1',
    status: 0x0034,
    serialNumber: 'f420d721',
    productName: 'FANUC Robot R30iB+',
    state: 'Default Get Attributes All',
  };

  const socketAddressObj = {
    sinFamilly: 512,
    sinAddress: '192.168.1.73',
    sinPort: 44818,
    sinZero: [0, 0, 0, 0, 0, 0, 0, 0],
  };

  const identityItemObj = {
    identity: identityObj,
    socketAddress: socketAddressObj,
    protocol: 1,
  };

  const lisIdentityObj = {
    itemCount: 1,
    identityItem: identityItemObj,
  };


  test('Parse ListIdentity buffer', ()=> {
    const liBuff = Buffer.from(listIdentityItemHexStr, 'hex');
    const listIdentity = enip.data.ListIdentity.parse(liBuff);
    expect(listIdentity.toJSON()).toStrictEqual(lisIdentityObj);
  });
  test('Encode ListIdentity object', ()=> {
    const socketAddress = new enip.data.item.SocketAddr('192.168.1.73');
    const cipIdentity = new Identity(356,
        device.Profile.CommunicationsAdapter,
        4,
        3,
        1,
        0x0034,
        0xf420d721,
        'FANUC Robot R30iB+',
        device.State.DefaultGetAttributesAll);

    // BUG: by default the sinFamily is 0x0002 (2 write on 2 byte in BE byte order)
    // but the fanuc controler send 0x0200 (512 write on 2 bytes in BE)
    socketAddress.sinFamilly = 512;

    const identityItem = new enip.data.item.ListIdentity(
        cipIdentity,
        socketAddress);

    const listIdentity = new enip.data.ListIdentity(identityItem);
    const listIdentityBuff = listIdentity.encode();

    expect(listIdentityBuff.toString('hex')).toBe(listIdentityItemHexStr);
  });
});
