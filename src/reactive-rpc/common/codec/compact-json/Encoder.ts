import {JSON, json_string} from '../../../../json-brand';
import {ReactiveRpcMessage} from '../../messages/nominal';
import {encode} from '../compact/encode';
import {CompactMessage} from '../compact/types';

export class Encoder {
  public encode(messages: ReactiveRpcMessage[]): json_string<CompactMessage | CompactMessage[]> {
    const compact = encode(messages);
    return JSON.stringify(compact);
  }
}
