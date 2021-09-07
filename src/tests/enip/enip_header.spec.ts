
import * as enip from 'enip';

describe('ENIP header encoding and parsing', ()=> {
  // eslint-disable-next-line max-len
  const listIdentityReqHexStr ='630000000000000000000000000000000000000000000000';
  // eslint-disable-next-line max-len
  const registerSessionReqHexStr = '650004000000000000000000000000000000000000000000';
  // eslint-disable-next-line max-len
  const sendRRdataReqHexStr = '6f001800f03db53b00000000000000000000000000000000';

  const listIdentityReqObject = {
    command: 'ListIdentity',
    dataLength: 0,
    session: '00000000',
    status: 'SUCCESS',
    senderContext: [0, 0, 0, 0, 0, 0, 0, 0],
    options: 0,
  };

  const registerSessionReqObject = {
    command: 'RegisterSession',
    dataLength: 4,
    session: '00000000',
    status: 'SUCCESS',
    senderContext: [0, 0, 0, 0, 0, 0, 0, 0],
    options: 0,
  };

  const sendRRdataReqObject = {
    command: 'SendRRData',
    dataLength: 24,
    session: '3bb53df0',
    status: 'SUCCESS',
    senderContext: [0, 0, 0, 0, 0, 0, 0, 0],
    options: 0,
  };

  test('parse listIdentity request header', ()=> {
    const liReqBuffer = Buffer.from(listIdentityReqHexStr, 'hex');
    const header = enip.Header.parse(liReqBuffer);
    expect(header.toJSON()).toStrictEqual(listIdentityReqObject);
  });
  test('parse register session request header', ()=> {
    const sessionReqBuffer = Buffer.from(registerSessionReqHexStr, 'hex');
    const header = enip.Header.parse(sessionReqBuffer);
    expect(header.toJSON()).toStrictEqual(registerSessionReqObject);
  });
  test('parse get attribute single request header', ()=> {
    const srrdReqBuffer = Buffer.from(sendRRdataReqHexStr, 'hex');
    const header = enip.Header.parse(srrdReqBuffer);
    expect(header.toJSON()).toStrictEqual(sendRRdataReqObject);
  });
  test('encode listIdentity request header', ()=> {
    const header = enip.header.buildListIdentity();
    expect(header.toJSON()).toStrictEqual(listIdentityReqObject);
    expect(header.encode().toString('hex')).toBe(listIdentityReqHexStr);
  });
  test('encode register session request header', ()=> {
    const header = enip.header.buildRegSession();
    expect(header.toJSON()).toStrictEqual(registerSessionReqObject);
    expect(header.encode().toString('hex')).toBe(registerSessionReqHexStr);
  });
  test('encode sendRRdata request header', ()=> {
    const header = enip.header.buildSendRR(0x3bb53df0, 24);
    expect(header.toJSON()).toStrictEqual(sendRRdataReqObject);
    expect(header.encode().toString('hex')).toBe(sendRRdataReqHexStr);
  });
});
