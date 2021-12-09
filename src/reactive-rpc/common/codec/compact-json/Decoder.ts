import {JSON, json_string} from '../../../../json-brand';
import {decode} from '../compact/decode';
import {ReactiveRpcMessage} from '../../messages/nominal';
import {CompactMessage} from '../compact/types';

export class Decoder {
  public decode(json: json_string<CompactMessage>): ReactiveRpcMessage;
  public decode(json: json_string<CompactMessage[]>): ReactiveRpcMessage[];
  public decode(json: json_string<CompactMessage | CompactMessage[]>): ReactiveRpcMessage | ReactiveRpcMessage[] {
    const messages = JSON.parse(json);
    return decode(messages as any);
  }
}
