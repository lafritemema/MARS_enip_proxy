import {SendRRData} from '../../lib/enip/encapsulation/data/send_RR_data';
import {EPath, Logical} from 'cip/epath';
import {CIPMessage} from 'cip/message';
import {ENIPData} from 'enip/encapsulation';

describe('Parse/Encode SendRR encapsulated data for request/response', ()=> {
  const sendRRHexStrReq = '000000000000020000000000b20008000e03206b24013005';
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

  const sendRRReqObj = {
    interfaceHandle: 0,
    timeout: 0,
    enipCpf: cpfReqPacketObj,
  };

  // response data
  const sendRRHexStrRes = '000000000000020000000000b20008008e00000034000000';
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

  const cpfResPacketObj = {
    addressItem: addressItemObj,
    dataItem: respDataItemObj,
    optionalItems: [],
  };

  const sendRRResObj = {
    interfaceHandle: 0,
    timeout: 0,
    enipCpf: cpfResPacketObj,
  };

  test('Parse a SendRR encapsulated data => Request', ()=> {
    const srrBuff = Buffer.from(sendRRHexStrReq, 'hex');
    const srrData = SendRRData.parse(srrBuff);
    expect(srrData.toJSON()).toStrictEqual(sendRRReqObj);
  });
  test('Parse a SendRR encapsulated data => Response', ()=> {
    const srrBuff = Buffer.from(sendRRHexStrRes, 'hex');
    const srrData = SendRRData.parse(srrBuff);
    expect(srrData.toJSON()).toStrictEqual(sendRRResObj);
  });
  test('Encode a SendRR encapsulated data object => Request', ()=> {
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

    const srrData = new ENIPData.SendRR(cpf);
    const srrDataBuff = srrData.encode();

    expect(srrDataBuff.toString('hex')).toBe(sendRRHexStrReq);
  });
  test('Encode a SendRR encapsulated data object => Response', ()=> {
    const dataHexStr = '34000000';
    const dataBuffer = Buffer.from(dataHexStr, 'hex');
    const respMessage = new CIPMessage.Response(
        CIPMessage.Service.GET_ATTRIBUTE_SINGLE,
        CIPMessage.Status.Success,
        dataBuffer);

    const addressItem = ENIPData.Item.buildNullAddressItem();
    const dataItem = ENIPData.Item.buildUnconnectedDataItem(respMessage);

    const cpf = new ENIPData.CPF(addressItem, dataItem);
    const srrData = new ENIPData.SendRR(cpf);
    const srrBuff = srrData.encode();

    expect(srrBuff.toString('hex')).toBe(sendRRHexStrRes);
  });
});
