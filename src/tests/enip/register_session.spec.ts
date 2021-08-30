
// eslint-disable-next-line max-len
import {RegisterSession} from '../../lib/enip/encapsulation/data/register_session';

describe('Parse/Encode a RegisterSession encapsulated data response', ()=> {
  const regSessionHexStr = '01000000';
  const regSessionObj = {
    protocolVersion: 1,
    optionFlags: 0,
  };
  test('Parse RegisterSession buffer', ()=> {
    const regSessionBuffer = Buffer.from(regSessionHexStr, 'hex');
    const regSession = RegisterSession.parse(regSessionBuffer);
    expect(regSession.toJSON()).toStrictEqual(regSessionObj);
  });
  test('Encode registerSession object', ()=> {
    const regSession = new RegisterSession();
    const regSessionBuff = regSession.encode();
    expect(regSessionBuff.toString('hex')).toBe(regSessionHexStr);
  });
});

