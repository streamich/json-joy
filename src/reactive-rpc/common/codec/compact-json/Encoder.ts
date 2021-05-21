import {JSON, json_string} from 'ts-brand-json';
import {ReactiveRpcMessage} from "../../messages/nominal";
import {encode} from "../compact/encode";
import {CompactMessage} from "../compact/types";

export class Encoder {
  public encode(messages: ReactiveRpcMessage[]): json_string<CompactMessage | CompactMessage[]> {
    const compact = encode(messages);
    return JSON.stringify(compact);
  }
}
