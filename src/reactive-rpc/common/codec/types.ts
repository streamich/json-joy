import {ReactiveRpcMessage} from '../messages';

export interface Codec<T = unknown> {
  encoder: {
    encode(messages: ReactiveRpcMessage[]): T;
  };
  decoder: {
    decode(data: T): ReactiveRpcMessage | ReactiveRpcMessage[];
  };
}
