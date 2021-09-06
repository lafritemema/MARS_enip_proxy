import {EnipMessage} from './enip_message';
import {ENIPHeader, ENIPData} from './encapsulation';

const ENIP = {
  Command: ENIPHeader.Command,
  Message: EnipMessage,
  Status: ENIPHeader.Status,
  Header: ENIPHeader,
  Data: ENIPData,
};

export {ENIP};
