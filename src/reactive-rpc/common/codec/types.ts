import type {JsonValueCodec} from '@jsonjoy.com/json-pack/lib/codecs/types';
import type {ReactiveRpcMessage} from '../messages';
import type {RpcMessageFormat} from './constants';

export interface RpcMessageCodec {
  id: string;
  format: RpcMessageFormat;
  encodeMessage(jsonCodec: JsonValueCodec, message: ReactiveRpcMessage): void;
  encodeBatch(jsonCodec: JsonValueCodec, batch: ReactiveRpcMessage[]): void;
  encode(jsonCodec: JsonValueCodec, batch: ReactiveRpcMessage[]): Uint8Array;
  decodeBatch(jsonCodec: JsonValueCodec, uint8: Uint8Array): ReactiveRpcMessage[];
}
