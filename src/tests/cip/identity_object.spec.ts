import {DeviceProfile} from '../../lib/cip/identity/device_profile';
import {DeviceState} from '../../lib/cip/identity/device_state';
import {IdentityObject} from '../../lib/cip/identity/identity_object';

describe('CIP identity object parsing and encoding', ()=> {
  // eslint-disable-next-line max-len
  const identityHexString = '64010c0004000301340021d720f41246414e554320526f626f742052333069422bff';

  const identityJSON = {
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

  test('CIP identity object parsing', ()=> {
    const idObjectBuff = Buffer.from(identityHexString, 'hex');
    const idObject = IdentityObject.parse(idObjectBuff);
    expect(idObject.toJSON()).toStrictEqual(identityJSON);
  });

  test('CIP Indentity object encoding', ()=> {
    const idObject = new IdentityObject(356,
        DeviceProfile.CommunicationsAdapter,
        4,
        3,
        1,
        0x0034,
        0xf420d721,
        'FANUC Robot R30iB+',
        DeviceState.DefaultGetAttributesAll);
    const idObjectBuff = idObject.encode();
    expect(idObjectBuff.toString('hex')).toBe(identityHexString);
  });
});

