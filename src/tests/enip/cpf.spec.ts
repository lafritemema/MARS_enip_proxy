// TODO : implement test for cpf and cpf items

import {EPath, Logical} from 'cip/epath';
import {CIPMessage} from 'cip/message';
import {ENIPData} from 'enip/encapsulation';


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
    itemType: 'DATA_UNCONNECTED_MESSAGE',
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
    itemType: 'DATA_UNCONNECTED_MESSAGE',
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
    const cpf = ENIPData.CPF.parse(reqBuffer);

    expect(cpf.toJSON()).toStrictEqual(cpfReqPacketObj);
  });

  test('CPF packet parsing : response', ()=> {
    const respBuffer = Buffer.from(responseCPFStr, 'hex');
    const cpf = ENIPData.CPF.parse(respBuffer);

    expect(cpf.toJSON()).toStrictEqual(cpfRespPacketObj);
  });

  test('CPF packet encoding : request', ()=> {
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
    const reqMessage = new CIPMessage.Request(
        CIPMessage.Service.GET_ATTRIBUTE_SINGLE,
        epath);

    const addressItem = ENIPData.Item.buildNullAddressItem();
    const dataItem = ENIPData.Item.buildUnconnectedDataItem(reqMessage);
    const cpf = new ENIPData.CPF(addressItem, dataItem);

    const reqBuffer = cpf.encode();
    expect(reqBuffer.toString('hex')).toBe(requestCPFStr);
  });
  test('CPF packet encoding : response', ()=> {
    const dataHexStr = '34000000';
    const dataBuffer = Buffer.from(dataHexStr, 'hex');
    const respMessage = new CIPMessage.Response(
        CIPMessage.Service.GET_ATTRIBUTE_SINGLE,
        CIPMessage.Status.Success,
        dataBuffer);

    const addressItem = ENIPData.Item.buildNullAddressItem();
    const dataItem = ENIPData.Item.buildUnconnectedDataItem(respMessage);

    const cpf = new ENIPData.CPF(addressItem, dataItem);

    const respBuffer = cpf.encode();
    expect(respBuffer.toString('hex')).toBe(responseCPFStr);
  });
});
