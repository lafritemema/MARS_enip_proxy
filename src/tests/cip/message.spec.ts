import {Message} from '../../lib/cip/message/message';

describe('Test message parsing', ()=> {
  const requestHexString = '0e03206b24013005';
  const responseHexString = '8e00000034000000';

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


  test('Parse a request buffer', ()=> {
    const requestBuffer = Buffer.from(requestHexString, 'hex');
    const message = Message.parse(requestBuffer);

    expect(message.toJSON()).toStrictEqual(reqMsgObj);
  });
  test('Parse a reponse buffer', ()=> {
    const responseBuffer = Buffer.from(responseHexString, 'hex');
    const message = Message.parse(responseBuffer);

    expect(message.toJSON()).toStrictEqual(respMsgObj);
  });

  // TODO : test build message
});
