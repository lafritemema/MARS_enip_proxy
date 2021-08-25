// TODO : implement test for cpf and cpf items

import {EPath} from '../../lib/cip/epath';
import {RequestMessage, ResponseMessage} from '../../lib/cip/message/message';
import {MessageService} from '../../lib/cip/message/message_service';
import {ResponseStatus} from '../../lib/cip/message/response_status';
import {LogicalFormat} from '../../lib/cip/segment/logical/logical_format';
import {LogicalSegment} from '../../lib/cip/segment/logical/logical_segment';
import {LogicalType} from '../../lib/cip/segment/logical/logical_type';
import {EnipCPF} from '../../lib/enip/encapsulation/data/cpf';
import {DataItem} from '../../lib/enip/encapsulation/data/item/data_item';
import {AddressItem} from '../../lib/enip/encapsulation/data/item/address_item';

describe('CPF ecapsulation parsing and encoding', ()=> {
  // request data
  const requestCPFStr = '000000000000020000000000b20008000e03206b24013005';
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
  };
  const reqDataItemObj = {
    itemType: 'DATA_UNCONNECTED_MESSAGE',
    data: reqMsgObj,
  };
  const cpfReqPacketObj = {
    addressItem: addressItemObj,
    dataItem: reqDataItemObj,
    optionalItems: [],
    timeout: 0,
  };

  // response data
  const responseCPFStr = '000000000000020000000000b20008008e00000034000000';
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
  };

  const cpfRespPacketObj = {
    addressItem: addressItemObj,
    dataItem: respDataItemObj,
    optionalItems: [],
    timeout: 0,
  };

  test('CPF packet parsing : request', ()=> {
    const reqBuffer = Buffer.from(requestCPFStr, 'hex');
    const cpf = EnipCPF.parse(reqBuffer);

    expect(cpf.toJSON()).toStrictEqual(cpfReqPacketObj);
  });

  test('CPF packet parsing : response', ()=> {
    const respBuffer = Buffer.from(responseCPFStr, 'hex');
    const cpf = EnipCPF.parse(respBuffer);

    expect(cpf.toJSON()).toStrictEqual(cpfRespPacketObj);
  });

  test('CPF packet encoding : request', ()=> {
    const classSeg = new LogicalSegment(LogicalType.CLASS_ID,
        LogicalFormat.BIT_8,
        0x6b);

    const instanceSeg = new LogicalSegment(LogicalType.INSTANCE_ID,
        LogicalFormat.BIT_8,
        1);

    const attributeSeg = new LogicalSegment(LogicalType.ATTRIBUTE_ID,
        LogicalFormat.BIT_8,
        5);

    const epath = new EPath([classSeg, instanceSeg, attributeSeg]);
    const reqMessage = new RequestMessage(MessageService.GET_ATTRIBUTE_SINGLE,
        epath);

    const addressItem = AddressItem.buildNullAddressItem();
    const dataItem = DataItem.buildUnconnectedDataItem(reqMessage);
    const cpf = new EnipCPF(addressItem, dataItem);

    const reqBuffer = cpf.encode();
    expect(reqBuffer.toString('hex')).toBe(requestCPFStr);
  });
  test('CPF packet encoding : response', ()=> {
    const dataHexStr = '34000000';
    const dataBuffer = Buffer.from(dataHexStr, 'hex');
    const respMessage = new ResponseMessage(MessageService.GET_ATTRIBUTE_SINGLE,
        ResponseStatus.Success,
        dataBuffer);

    const addressItem = AddressItem.buildNullAddressItem();
    const dataItem = DataItem.buildUnconnectedDataItem(respMessage);

    const cpf = new EnipCPF(addressItem, dataItem);

    const respBuffer = cpf.encode();
    expect(respBuffer.toString('hex')).toBe(responseCPFStr);
  });
});
