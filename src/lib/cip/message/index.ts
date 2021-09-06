import {Message,
  RequestMessage,
  ResponseMessage,
} from './message';
import {MessageService} from './message_service';
import {MessageType} from './message_type';
import {ResponseStatus} from './response_status';

const CipMessage = {
  Message: Message,
  Request: RequestMessage,
  Response: ResponseMessage,
  Service: MessageService,
  Type: MessageType,
  Status: ResponseStatus,
};

export {CipMessage};
