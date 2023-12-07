import type {JsonValueCodec} from '../json-pack/codecs/types';
import type {ResolveType, Type} from '../json-type';

export class Value<T extends Type = Type> {
  constructor(public type: T, public data: ResolveType<T>) {}

  public encode(codec: JsonValueCodec): void {
    const data = this.data;
    if (data === undefined) return;
    this.type.encoder(codec.format)(this.data, codec.encoder);
  }
}
