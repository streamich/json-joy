import {
  BooleanSchema,
  NumberSchema,
  StringSchema,
  ArraySchema,
  ObjectSchema,
  ObjectFieldSchema,
  MapSchema,
  NoT,
  BinarySchema,
  AnySchema,
  RefSchema,
  OrSchema,
  Schema,
  ObjectOptionalFieldSchema,
  Optional,
  ConstSchema,
  TupleSchema,
  FunctionSchema,
  FunctionStreamingSchema,
  TType,
} from '.';

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

  public Boolean(id: string, options?: Omit<NoT<BooleanSchema>, 'id'>): BooleanSchema;
  public Boolean(options?: NoT<BooleanSchema>): BooleanSchema;
  public Boolean(a?: string | NoT<BooleanSchema>, b?: NoT<BooleanSchema> | void): BooleanSchema {
    if (typeof a === 'string') return this.Boolean({id: a, ...(b || {})});
    return {kind: 'bool', ...(a || {})};
  }

  public Number(options?: NoT<NumberSchema>): NumberSchema {
    return {kind: 'num', ...options};
  }

  public String(id: string, options?: NoT<StringSchema>): StringSchema;
  public String(options?: NoT<StringSchema>): StringSchema;
  public String(a?: string | NoT<StringSchema>, b?: NoT<StringSchema>): StringSchema {
    if (typeof a === 'string') return this.String({id: a, ...(b || {})});
    return {kind: 'str', ...(a || {})};
  }

  public Binary<T extends Schema>(type: T, options: Optional<BinarySchema> = {}): BinarySchema {
    return {
      kind: 'bin',
      type,
      ...options,
    };
  }

  public Array<T extends Schema>(
    id: string,
    type: T,
    options?: Omit<NoT<ArraySchema<T>>, 'id' | 'type'>,
  ): ArraySchema<T>;
  public Array<T extends Schema>(type: T, options?: Omit<NoT<ArraySchema<T>>, 'type'>): ArraySchema<T>;
  public Array<T extends Schema>(
    a: string | T,
    b?: T | Omit<NoT<ArraySchema<T>>, 'type'>,
    c?: Omit<NoT<ArraySchema<T>>, 'id' | 'type'>,
  ): ArraySchema<T> {
    if (typeof a === 'string') return this.Array(b as T, {id: a, ...(c || {})});
    return {kind: 'arr', ...(b as Omit<NoT<ArraySchema<T>>, 'id' | 'type'>), type: a as T};
  }

  /**
   * Use TypeScript const when defining a constant value.
   *
   *
   * @example
   *
   * ```ts
   * s.Const('foo' as const);
   * ```
   */
  public Const<V>(
    value: V,
    options?: Optional<ConstSchema<V>>,
  ): ConstSchema<
    string extends V ? never : number extends V ? never : boolean extends V ? never : any[] extends V ? never : V
  > {
    return {kind: 'const', value: value as any, ...options};
  }

  public Tuple<T extends Schema[]>(...types: T): TupleSchema<T> {
    return {kind: 'tup', types};
  }

  public fields<F extends ObjectFieldSchema<any, any>[]>(...fields: ObjectSchema<F>['fields']): F {
    return fields;
  }

  public Object<F extends ObjectFieldSchema<string, Schema>[] | readonly ObjectFieldSchema<string, Schema>[]>(
    options: NoT<ObjectSchema<F>>,
  ): ObjectSchema<F>;
  public Object<F extends ObjectFieldSchema<string, Schema>[] | readonly ObjectFieldSchema<string, Schema>[]>(
    fields: ObjectSchema<F>['fields'],
    options?: Optional<ObjectSchema<F>>,
  ): ObjectSchema<F>;
  public Object<F extends ObjectFieldSchema<string, Schema>[] | readonly ObjectFieldSchema<string, Schema>[]>(
    ...fields: ObjectSchema<F>['fields']
  ): ObjectSchema<F>;
  public Object<F extends ObjectFieldSchema<string, Schema>[] | readonly ObjectFieldSchema<string, Schema>[]>(
    ...args: unknown[]
  ): ObjectSchema<F> {
    const first = args[0];
    if (
      args.length === 1 &&
      first &&
      typeof first === 'object' &&
      (first as NoT<ObjectSchema<F>>).fields instanceof Array
    )
      return {kind: 'obj', ...(first as NoT<ObjectSchema<F>>)};
    if (args.length >= 1 && args[0] instanceof Array)
      return this.Object({fields: args[0] as F, ...(args[1] as Optional<ObjectSchema<F>>)});
    return this.Object({fields: args as F});
  }

  /** @deprecated Use `.prop`. */
  public Field<K extends string, V extends Schema>(
    key: K,
    type: V,
    options: Omit<NoT<ObjectFieldSchema<K, V>>, 'key' | 'type' | 'optional'> = {},
  ): ObjectFieldSchema<K, V> {
    return {
      kind: 'field',
      key,
      type,
      ...options,
    };
  }

  /** @deprecated Use `.propOpt`. */
  public FieldOpt<K extends string, V extends Schema>(
    key: K,
    type: V,
    options: Omit<NoT<ObjectFieldSchema<K, V>>, 'key' | 'type' | 'optional'> = {},
  ): ObjectOptionalFieldSchema<K, V> {
    return {
      kind: 'field',
      key,
      type,
      ...options,
      optional: true,
    };
  }

  /** Declares an object property. */
  public prop<K extends string, V extends Schema>(
    key: K,
    type: V,
    options: Omit<NoT<ObjectFieldSchema<K, V>>, 'key' | 'type' | 'optional'> = {},
  ): ObjectFieldSchema<K, V> {
    return {
      kind: 'field',
      key,
      type,
      ...options,
    };
  }

  /** Declares an optional object property. */
  public propOpt<K extends string, V extends Schema>(
    key: K,
    type: V,
    options: Omit<NoT<ObjectFieldSchema<K, V>>, 'key' | 'type' | 'optional'> = {},
  ): ObjectOptionalFieldSchema<K, V> {
    return {
      kind: 'field',
      key,
      type,
      ...options,
      optional: true,
    };
  }

  public Map<T extends Schema>(type: T, options?: Omit<NoT<MapSchema<T>>, 'type'>): MapSchema<T> {
    return {kind: 'map', type, ...options};
  }

  public Any(options: NoT<AnySchema> = {}): AnySchema {
    return {
      kind: 'any',
      ...options,
    };
  }

  public Ref<T extends TType = any>(ref: string): RefSchema<T> {
    return {
      kind: 'ref',
      ref: ref as string & T,
    };
  }

  public Or<T extends Schema[]>(...types: T): OrSchema<T> {
    return {
      kind: 'or',
      types,
      discriminator: ['num', -1],
    };
  }

  public Function<Req extends Schema, Res extends Schema>(req: Req, res: Res): FunctionSchema<Req, Res> {
    return {
      kind: 'fn',
      req,
      res,
    };
  }

  public Function$<Req extends Schema, Res extends Schema>(req: Req, res: Res): FunctionStreamingSchema<Req, Res> {
    return {
      kind: 'fn$',
      req,
      res,
    };
  }
}
