import {decode} from "../compact/decode";
import {ReactiveRpcMessage} from "../../messages/nominal";
import {CompactMessage} from "../compact/types";
import {Decoder as MessagePackDecoder} from '../../../../json-pack/Decoder';

export class Decoder {
  protected readonly msgpack = new MessagePackDecoder();

  public decode(arr: Uint8Array): ReactiveRpcMessage[] {
    const messages = this.msgpack.decode(arr) as CompactMessage[];
    return decode(messages);
  }
}
