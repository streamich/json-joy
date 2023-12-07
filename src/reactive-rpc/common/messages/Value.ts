import {Value as V} from '../../../json-type-value/Value';
import type {JsonValueCodec} from '../../../json-pack/codecs/types';
import type {Type} from '../../../json-type';

export class RpcValue<V = unknown> extends V<any> {
  constructor(public data: V, public type: Type | undefined) {
    super(type, data);
  }

  public encode(codec: JsonValueCodec): void {
    const value = this.data;
    const type = this.type;
    if (value === undefined) return;
    const encoder = codec.encoder;
    if (!type) encoder.writeAny(value);
    else type.encoder(codec.format)(value, encoder);
  }
}
