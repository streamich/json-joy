import {ReactiveRpcMessage} from "../../messages/nominal";
import {CompactMessage} from "./types";
import {decodeMsg, decode} from './decode';

export class Decoder {
  public decodeMsg<T = unknown>(message: CompactMessage): ReactiveRpcMessage<T> {
    return decodeMsg(message);
  }
  
  public decode<T = unknown>(messages: CompactMessage[]): ReactiveRpcMessage<T>[] {
    return decode(messages);
  }
}
