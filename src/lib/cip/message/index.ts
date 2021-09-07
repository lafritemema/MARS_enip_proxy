import {Message as CIPMessage,
  RequestMessage,
  ResponseMessage,
} from './message';
import {MessageService} from './message_service';
import {MessageType} from './message_type';
import {ResponseStatus} from './response_status';

export default CIPMessage;

export {
  RequestMessage as Request,
  ResponseMessage as Response,
  MessageService as Service,
  MessageType as Type,
  ResponseStatus as Status,
};
