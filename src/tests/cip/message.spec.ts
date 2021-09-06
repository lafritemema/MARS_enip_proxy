import {EPath, Logical} from 'cip/epath';
import {CipMessage} from 'cip/message';

describe('CIP message parsing and encoding', ()=> {
  const requestHexString = '0e03206b24013005'; // get attribute single request
  const responseHexString = '8e00000034000000'; // get attribute single response

  const reqClassObj = {
    segment: 'LOGICAL',
    type: 'CLASS_ID',
    format: 'BIT_8',
    value: 107};
  const reqInstanceObj = {
    segment: 'LOGICAL',
    type: 'INSTANCE_ID',
    format: 'BIT_8',
    value: 1};
  const reqAttrObj = {
    segment: 'LOGICAL',
    type: 'ATTRIBUTE_ID',
    format: 'BIT_8',
    value: 5};
  const reqMsgObj = {
    type: 'REQUEST',
    service: 'GET_ATTRIBUTE_SINGLE',
    path: [reqClassObj, reqInstanceObj, reqAttrObj],
    data: '',
  };

  const respMsgObj = {
    type: 'RESPONSE',
    service: 'GET_ATTRIBUTE_SINGLE',
    status: 'Success',
    addStatus: '',
    data: '34000000',
  };

  test('Parse a get attribute single request buffer', ()=> {
    const requestBuffer = Buffer.from(requestHexString, 'hex');
    const message = CipMessage.Message.parse(requestBuffer);

    expect(message.toJSON()).toStrictEqual(reqMsgObj);
  });
  test('Parse a get attribute single reponse buffer', ()=> {
    const responseBuffer = Buffer.from(responseHexString, 'hex');
    const message = CipMessage.Message.parse(responseBuffer);

    expect(message.toJSON()).toStrictEqual(respMsgObj);
  });

  test('Encode a get attribute single request buffer', ()=> {
    const classSeg = new Logical.Segment(Logical.Type.CLASS_ID,
        Logical.Format.BIT_8,
        0x6b);

    const instanceSeg = new Logical.Segment(Logical.Type.INSTANCE_ID,
        Logical.Format.BIT_8,
        1);

    const attributeSeg = new Logical.Segment(Logical.Type.ATTRIBUTE_ID,
        Logical.Format.BIT_8,
        5);

    const epath = new EPath([classSeg, instanceSeg, attributeSeg]);
    const reqMessage = new CipMessage.Request(
        CipMessage.Service.GET_ATTRIBUTE_SINGLE,
        epath);

    const rBuffer = reqMessage.encode();
    expect(rBuffer.toString('hex')).toBe(requestHexString);
  });
  test('Encode a get attribute single response buffer', () => {
    const dataHexStr = '34000000';
    const dataBuffer = Buffer.from(dataHexStr, 'hex');
    const respMessage = new CipMessage.Response(
        CipMessage.Service.GET_ATTRIBUTE_SINGLE,
        CipMessage.Status.Success,
        dataBuffer);
    const respBuffer = respMessage.encode();
    expect(respBuffer.toString('hex')).toBe(responseHexString);
  });
});
