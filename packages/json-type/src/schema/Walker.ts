import type {Schema} from './schema';

export interface WalkerOpts {
  onType?: (type: Schema) => void;
}

export class Walker {
  public static readonly walk = (type: Schema, opts: WalkerOpts = {}): void => {
    const walker = new Walker(opts);
    walker.walk(type);
  };

  constructor(private opts: WalkerOpts = {}) {}

  public walk(type: Schema): void {
    const onType = this.opts.onType ?? ((type: Schema) => {});
    switch (type.kind) {
      case 'key': {
        onType(type);
        this.walk(type.value as Schema);
        break;
      }
      case 'any':
      case 'con':
      case 'bool':
      case 'num':
      case 'str':
      case 'bin': {
        onType(type);
        break;
      }
      case 'arr': {
        onType(type);
        if (type.head) for (const t of type.head) this.walk(t);
        if (type.type) this.walk(type.type);
        if (type.tail) for (const t of type.tail) this.walk(t);
        break;
      }
      case 'obj': {
        onType(type);
        for (const key of type.keys) this.walk(key.value);
        break;
      }
      case 'map': {
        onType(type);
        this.walk(type.value);
        if (type.key) this.walk(type.key);
        break;
      }
      case 'or': {
        onType(type);
        for (const t of type.types) this.walk(t as Schema);
        break;
      }
      case 'ref': {
        onType(type);
        break;
      }
      case 'fn':
      case 'fn$': {
        onType(type);
        this.walk(type.req as Schema);
        this.walk(type.res as Schema);
        break;
      }
      case 'module': {
        onType(type);
        for (const alias of type.keys) this.walk(alias.value as Schema);
        break;
      }
      default:
        throw new Error('UNK_KIND');
    }
  }
}
