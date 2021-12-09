import {JSON, json_string} from '../../../../json-brand';
import {ReactiveRpcJsonMessage} from '../../messages/json';
import {encode} from '../compact/encode';
import {CompactMessage} from '../compact/types';

export class Encoder {
  public encode(messages: ReactiveRpcJsonMessage[]): json_string<CompactMessage | CompactMessage[]> {
    const compact = encode(messages);
    return JSON.stringify(compact);
  }
}
