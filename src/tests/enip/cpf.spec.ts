import * as cip from 'cip';
import * as enip from 'enip';

describe('CPF encapsulation parsing and encoding', ()=> {
  // request data
  const requestCPFStr = '020000000000b20008000e03206b24013005';
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
  const addressItemObj = {
    itemType: 'ADDR_NULL',
    length: 4,
  };
  const reqDataItemObj = {
    itemType: 'UNCONNECTED_MESSAGE',
    data: reqMsgObj,
    length: 12,
  };
  const cpfReqPacketObj = {
    addressItem: addressItemObj,
    dataItem: reqDataItemObj,
    optionalItems: [],
  };

  // response data
  const responseCPFStr = '020000000000b20008008e00000034000000';
  const respMsgObj = {
    type: 'RESPONSE',
    service: 'GET_ATTRIBUTE_SINGLE',
    status: 'Success',
    addStatus: '',
    data: '34000000',
  };
  const respDataItemObj = {
    itemType: 'UNCONNECTED_MESSAGE',
    data: respMsgObj,
    length: 12,
  };

  const cpfRespPacketObj = {
    addressItem: addressItemObj,
    dataItem: respDataItemObj,
    optionalItems: [],
  };

  test('CPF packet parsing : request', ()=> {
    const reqBuffer = Buffer.from(requestCPFStr, 'hex');
    const cpf = enip.data.CPF.parse(reqBuffer);

    expect(cpf.toJSON()).toStrictEqual(cpfReqPacketObj);
  });

  test('CPF packet parsing : response', ()=> {
    const respBuffer = Buffer.from(responseCPFStr, 'hex');
    const cpf = enip.data.CPF.parse(respBuffer);

    expect(cpf.toJSON()).toStrictEqual(cpfRespPacketObj);
  });

  test('CPF packet encoding : request', ()=> {
    const classSeg = new cip.epath.segment.Logical(
        cip.epath.segment.logical.Type.CLASS_ID,
        cip.epath.segment.logical.Format.BIT_8,
        0x6b);

    const instanceSeg = new cip.epath.segment.Logical(
        cip.epath.segment.logical.Type.INSTANCE_ID,
        cip.epath.segment.logical.Format.BIT_8,
        1);

    const attributeSeg = new cip.epath.segment.Logical(
        cip.epath.segment.logical.Type.ATTRIBUTE_ID,
        cip.epath.segment.logical.Format.BIT_8,
        5);

    const epath = new cip.EPath([classSeg, instanceSeg, attributeSeg]);
    const reqMessage = new cip.message.Request(
        cip.message.Service.GET_ATTRIBUTE_SINGLE,
        epath);

    const addressItem = enip.data.item.buildNullAddressItem();
    const dataItem = enip.data.item.buildUnconnectedDataItem(reqMessage);
    const cpf = new enip.data.CPF(addressItem, dataItem);

    const reqBuffer = cpf.encode();
    expect(reqBuffer.toString('hex')).toBe(requestCPFStr);
  });
  test('CPF packet encoding : response', ()=> {
    const dataHexStr = '34000000';
    const dataBuffer = Buffer.from(dataHexStr, 'hex');
    const respMessage = new cip.message.Response(
        cip.message.Service.GET_ATTRIBUTE_SINGLE,
        cip.message.Status.Success,
        dataBuffer);

    const addressItem = enip.data.item.buildNullAddressItem();
    const dataItem = enip.data.item.buildUnconnectedDataItem(respMessage);

    const cpf = new enip.data.CPF(addressItem, dataItem);

    const respBuffer = cpf.encode();
    expect(respBuffer.toString('hex')).toBe(responseCPFStr);
  });
});
