import type {JsonValueCodec} from '../../../json-pack/codecs/types';
import type {Type} from '../../../json-type';

export class Value<V = unknown> {
  constructor(public data: V, public type: Type | undefined) {}

  public encode(codec: JsonValueCodec): void {
    const value = this.data;
    const type = this.type;
    if (value === undefined) return;
    const encoder = codec.encoder;
    if (!type) encoder.writeAny(value);
    else type.encoder(codec.format)(value, encoder);
  }
}
