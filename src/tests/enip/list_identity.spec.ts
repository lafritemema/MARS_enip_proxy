
// eslint-disable-next-line max-len
import {SocketAddrItem} from '../../lib/enip/encapsulation/data/item/socketaddr_item';
import {DeviceProfile} from '../../lib/cip/identity/device_profile';
import {DeviceState} from '../../lib/cip/identity/device_state';
import {IdentityObject} from '../../lib/cip/identity/identity_object';
import {ListIdentity} from '../../lib/enip/encapsulation/data/list_identity';
// eslint-disable-next-line max-len
import {ListIdentityItem} from '../../lib/enip/encapsulation/data/item/list_identity_item';

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
    const listIdentity = ListIdentity.parse(liBuff);
    expect(listIdentity.toJSON()).toStrictEqual(lisIdentityObj);
  });
  test('Encode ListIdentity object', ()=> {
    const socketAddress = new SocketAddrItem('192.168.1.73');
    const idObject = new IdentityObject(356,
        DeviceProfile.CommunicationsAdapter,
        4,
        3,
        1,
        0x0034,
        0xf420d721,
        'FANUC Robot R30iB+',
        DeviceState.DefaultGetAttributesAll);

    // BUG: by default the sinFamily is 0x0002 (2 write on 2 byte in BE byte order)
    // but the fanuc controler send 0x0200 (512 write on 2 bytes in BE)
    socketAddress.sinFamilly = 512;

    const identityItem = new ListIdentityItem(
        idObject,
        socketAddress);

    const listIdentity = new ListIdentity(identityItem);
    const listIdentityBuff = listIdentity.encode();

    expect(listIdentityBuff.toString('hex')).toBe(listIdentityItemHexStr);
  });
});
