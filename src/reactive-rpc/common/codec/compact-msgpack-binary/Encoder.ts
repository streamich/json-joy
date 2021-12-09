import {encoder} from '../../../../json-pack/util';
import {ReactiveRpcBinaryMessage} from '../../messages/binary/types';

export class Encoder {
  protected readonly encoder = encoder;

  public encode(messages: ReactiveRpcBinaryMessage[]): Uint8Array {
    const encoder = this.encoder;
    const length = messages.length;
    encoder.reset();
    if (length === 1) {
      messages[0].writeCompact(encoder);
      return encoder.flush();
    }
    encoder.encodeArrayHeader(length);
    for (let i = 0; i < length; i++) messages[i].writeCompact(encoder);
    return encoder.flush();
  }
}
