import {SendRRData} from '../../lib/enip/encapsulation/data/send_RR_data';
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

    const srrData = new SendRRData(cpf);
    const srrDataBuff = srrData.encode();

    expect(srrDataBuff.toString('hex')).toBe(sendRRHexStrReq);
  });
  test('Encode a SendRR encapsulated data object => Response', ()=> {
    const dataHexStr = '34000000';
    const dataBuffer = Buffer.from(dataHexStr, 'hex');
    const respMessage = new ResponseMessage(MessageService.GET_ATTRIBUTE_SINGLE,
        ResponseStatus.Success,
        dataBuffer);

    const addressItem = AddressItem.buildNullAddressItem();
    const dataItem = DataItem.buildUnconnectedDataItem(respMessage);

    const cpf = new EnipCPF(addressItem, dataItem);
    const srrData = new SendRRData(cpf);
    const srrBuff = srrData.encode();

    expect(srrBuff.toString('hex')).toBe(sendRRHexStrRes);
  });
});
