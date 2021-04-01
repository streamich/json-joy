import {CompleteMessage} from "./CompleteMessage";
import {DataMessage} from "./DataMessage";
import {ErrorMessage} from "./ErrorMessage";
import {NotificationMessage} from "./NotificationMessage";
import {SubscribeMessage} from "./SubscribeMessage";
import {UnsubscribeMessage} from "./UnsubscribeMessage";

export type Messages =
  | CompleteMessage
  | DataMessage
  | ErrorMessage
  | NotificationMessage
  | SubscribeMessage
  | UnsubscribeMessage;
