import type {Type} from '../type';
import type * as _ from './schema';

export class SchemaBuilder {
  get str() {
    return this.String();
  }

  get num() {
    return this.Number();
  }

  get bool() {
    return this.Boolean();
  }

  get undef() {
    return this.Const<undefined>(undefined);
  }

  get nil() {
    return this.Const<null>(null);
  }

  get arr() {
    return this.Array(this.any);
  }

  get obj() {
    return this.Object();
  }

  get map() {
    return this.Map(this.any);
  }

  get bin() {
    return this.Binary(this.any);
  }

  get any() {
    return this.Any();
  }

  get fn() {
    return this.Function(this.any, this.any);
  }

  get fn$() {
    return this.Function$(this.any, this.any);
  }

  public Boolean(options?: _.NoT<_.BoolSchema>): _.BoolSchema {
    return {...options, kind: 'bool'};
  }

  public Number(options?: _.NoT<_.NumSchema>): _.NumSchema {
    return {...options, kind: 'num'};
  }

  public String(options?: _.NoT<_.StrSchema>): _.StrSchema {
    return {...options, kind: 'str'};
  }

  public Binary<T extends _.Schema>(type: T, options: _.Optional<Omit<_.BinSchema, 'type'>> = {}): _.BinSchema<T> {
    return {
      ...options,
      kind: 'bin',
      type,
    };
  }

  public Array<T extends _.Schema>(type: T, options?: Omit<_.NoT<_.ArrSchema<T>>, 'type'>): _.ArrSchema<T, [], []> {
    return {
      ...options,
      kind: 'arr',
      type,
    };
  }

  /**
   * Use TypeScript const when defining a constant value.
   *
   * @example
   *
   * ```ts
   * s.Const('foo' as const);
   * ```
   */
  public Const<V>(
    value: _.Narrow<V>,
    options?: _.Optional<_.ConSchema<V>>,
  ): _.ConSchema<
    string extends V ? never : number extends V ? never : boolean extends V ? never : any[] extends V ? never : V
  > {
    return {...options, kind: 'con', value: value as any};
  }

  public Tuple<const Head extends _.Schema[], T extends _.Schema = _.Schema, const Tail extends [] | _.Schema[] = []>(
    head: Head,
    type?: T,
    tail?: Tail,
  ): _.ArrSchema<Type extends T ? _.Schema : T, Head, Tail> {
    const schema: _.ArrSchema<T, Head, Tail> = {kind: 'arr', head};
    if (type) schema.type = type;
    if (tail) schema.tail = tail;
    return schema;
  }

  public Object<F extends _.KeySchema<string, _.Schema>[] | readonly _.KeySchema<string, _.Schema>[]>(
    options: _.NoT<_.ObjSchema<F>>,
  ): _.ObjSchema<F>;
  public Object<F extends _.KeySchema<string, _.Schema>[] | readonly _.KeySchema<string, _.Schema>[]>(
    keys: _.ObjSchema<F>['keys'],
    options?: _.Optional<_.ObjSchema<F>>,
  ): _.ObjSchema<F>;
  public Object<F extends _.KeySchema<string, _.Schema>[] | readonly _.KeySchema<string, _.Schema>[]>(
    ...keys: _.ObjSchema<F>['keys']
  ): _.ObjSchema<F>;
  public Object<F extends _.KeySchema<string, _.Schema>[] | readonly _.KeySchema<string, _.Schema>[]>(
    ...args: unknown[]
  ): _.ObjSchema<F> {
    const first = args[0];
    if (
      args.length === 1 &&
      first &&
      typeof first === 'object' &&
      (first as _.NoT<_.ObjSchema<F>>).keys instanceof Array
    )
      return {kind: 'obj', ...(first as _.NoT<_.ObjSchema<F>>)};
    if (args.length >= 1 && args[0] instanceof Array)
      return this.Object({
        keys: args[0] as F,
        ...(args[1] as _.Optional<_.ObjSchema<F>>),
      });
    return this.Object({keys: args as F});
  }

  /** Declares an object property. */
  public Key<K extends string, V extends _.Schema>(
    key: K,
    value: V,
    options: Omit<_.NoT<_.KeySchema<K, V>>, 'key' | 'value' | 'optional'> = {},
  ): _.KeySchema<K, V> {
    return {
      ...options,
      kind: 'key',
      key,
      value,
    };
  }

  /** Declares an optional object property. */
  public KeyOpt<K extends string, V extends _.Schema>(
    key: K,
    value: V,
    options: Omit<_.NoT<_.KeySchema<K, V>>, 'key' | 'value' | 'optional'> = {},
  ): _.OptKeySchema<K, V> {
    return {
      ...options,
      kind: 'key',
      key,
      value,
      optional: true,
    };
  }

  public Map<V extends _.Schema, K extends _.Schema = _.StrSchema>(
    value: V,
    key?: K,
    options?: Omit<_.NoT<_.MapSchema<V, K>>, 'value' | 'key'>,
  ): _.MapSchema<V, K> {
    return {...(key && {key}), ...options, kind: 'map', value};
  }

  public Any(options: _.NoT<_.AnySchema> = {}): _.AnySchema {
    return {
      ...options,
      kind: 'any',
    };
  }

  public Ref<T extends _.SchemaBase = any>(ref: string, options: Omit<_.NoT<_.RefSchema>, 'ref'> = {}): _.RefSchema<T> {
    return {
      ...options,
      kind: 'ref',
      ref: ref as string & T,
    };
  }

  public Or<T extends _.Schema[]>(...types: T): _.OrSchema<T> {
    return {
      kind: 'or',
      types,
      discriminator: ['num', -1],
    };
  }

  public Function<Req extends _.Schema, Res extends _.Schema>(
    req: Req,
    res: Res,
    options: Omit<_.NoT<_.FnSchema>, 'req' | 'res'> = {},
  ): _.FnSchema<Req, Res> {
    return {
      ...options,
      kind: 'fn',
      req,
      res,
    };
  }

  public Function$<Req extends _.Schema, Res extends _.Schema>(
    req: Req,
    res: Res,
    options: Omit<_.NoT<_.FnRxSchema>, 'req' | 'res'> = {},
  ): _.FnRxSchema<Req, Res> {
    return {
      ...options,
      kind: 'fn$',
      req,
      res,
    };
  }
}
