import type {JsonValueCodec} from '@jsonjoy.com/json-pack/lib/codecs/types';
import type {ResolveType, Type} from '../json-type';

export class Value<T extends Type = Type> {
  constructor(
    public type: T,
    public data: ResolveType<T>,
  ) {}

  public encode(codec: JsonValueCodec): void {
    const value = this.data;
    const type = this.type;
    if (value === undefined) return;
    const encoder = codec.encoder;
    if (!type) encoder.writeAny(value);
    else type.encoder(codec.format)(value, encoder);
  }
}
