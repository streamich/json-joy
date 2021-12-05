import type {json_string} from '../../../../json-brand';
import type {ReactiveRpcJsonMessage} from '../../messages/json/types';
import type {CompactMessage, CompactMessageBatch} from '../../codec/compact/types';

export class Encoder {
  public encode(messages: ReactiveRpcJsonMessage[]): json_string<CompactMessage | CompactMessageBatch> {
    const length = messages.length;
    if (length === 1) return messages[0].toCompactJson();
    let out = '[' + messages[0].toCompactJson();
    for (let i = 1; i < length; i++) out += ',' + messages[i].toCompactJson();
    return (out + ']') as json_string<CompactMessage | CompactMessageBatch>;
  }
}
