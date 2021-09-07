import {EnipMessage} from './enip_message';
import {enipheader, EnipData, enipdata, EnipHeader} from './encapsulation';

export const Command = enipheader.Command;
export const Status = enipheader.Status;

export default EnipMessage;
export {
  EnipHeader as Header,
  EnipData as Data,
  enipdata as data,
  enipheader as header,
};
