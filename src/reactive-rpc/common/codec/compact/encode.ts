import type {ReactiveRpcMessage} from '../../messages/nominal/types';
import type {CompactMessage} from './types';

export function encode(messages: ReactiveRpcMessage[]): CompactMessage[] {
  const length = messages.length;
  const out: CompactMessage[] = [];
  for (let i = 0; i < length; i++) out.push(messages[i].toCompact());
  return out;
}
