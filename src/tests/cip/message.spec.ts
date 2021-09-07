import EPath, {segment} from 'cip/epath';
import CIPMessage, * as message from 'cip/message';

describe('CIP mess parsing and encoding', ()=> {
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
    const mess = CIPMessage.parse(requestBuffer);

    expect(mess.toJSON()).toStrictEqual(reqMsgObj);
  });
  test('Parse a get attribute single reponse buffer', ()=> {
    const responseBuffer = Buffer.from(responseHexString, 'hex');
    const mess = CIPMessage.parse(responseBuffer);

    expect(mess.toJSON()).toStrictEqual(respMsgObj);
  });

  test('Encode a get attribute single request buffer', ()=> {
    const classSeg = new segment.Logical(
        segment.logical.Type.CLASS_ID,
        segment.logical.Format.BIT_8,
        0x6b);

    const instanceSeg = new segment.Logical(
        segment.logical.Type.INSTANCE_ID,
        segment.logical.Format.BIT_8,
        1);

    const attributeSeg = new segment.Logical(
        segment.logical.Type.ATTRIBUTE_ID,
        segment.logical.Format.BIT_8,
        5);

    const epath = new EPath([classSeg, instanceSeg, attributeSeg]);
    const reqMessage = new message.Request(
        message.Service.GET_ATTRIBUTE_SINGLE,
        epath);

    const rBuffer = reqMessage.encode();
    expect(rBuffer.toString('hex')).toBe(requestHexString);
  });
  test('Encode a get attribute single response buffer', () => {
    const dataHexStr = '34000000';
    const dataBuffer = Buffer.from(dataHexStr, 'hex');
    const respMessage = new message.Response(
        message.Service.GET_ATTRIBUTE_SINGLE,
        message.Status.Success,
        dataBuffer);
    const respBuffer = respMessage.encode();
    expect(respBuffer.toString('hex')).toBe(responseHexString);
  });
});
