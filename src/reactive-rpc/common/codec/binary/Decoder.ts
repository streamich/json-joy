import {decodeFullMessages} from './decode';
import {ReactiveRpcBinaryMessage} from '../../messages/binary';

export class Decoder {
  public decode(arr: Uint8Array, offset: number, end: number): ReactiveRpcBinaryMessage[] {
    return decodeFullMessages(arr, offset, end);
  }
}
