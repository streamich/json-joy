import {ReactiveRpcMessage} from "../../messages/nominal";
import {CompactMessage} from "./types";
import {encode} from './encode';

export class Encoder {
  public encode(messages: ReactiveRpcMessage[]): CompactMessage[] {
    return encode(messages);
  }
}
