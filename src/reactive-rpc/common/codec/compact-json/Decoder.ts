import {JSON, json_string} from 'ts-brand-json';
import {decode} from "../compact/decode";
import {ReactiveRpcMessage} from "../../messages/nominal";
import {CompactMessage} from "../compact/types";

export class Decoder {
  public decode(json: json_string<CompactMessage[]>): ReactiveRpcMessage[] {
    const messages = JSON.parse(json);
    return decode(messages);
  }
}
