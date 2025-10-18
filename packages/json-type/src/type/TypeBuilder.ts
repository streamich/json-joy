import * as schema from '../schema';
import * as classes from './classes';
import type {Type, TypeOfAlias} from './types';

const {s} = schema;

type UnionToIntersection<U> = (U extends never ? never : (arg: U) => never) extends (arg: infer I) => void ? I : never;

type UnionToTuple<T> = UnionToIntersection<T extends never ? never : (t: T) => T> extends (_: never) => infer W
  ? [...UnionToTuple<Exclude<T, W>>, W]
  : [];

type ObjValueTuple<T, KS extends any[] = UnionToTuple<keyof T>, R extends any[] = []> = KS extends [
  infer K,
  ...infer KT,
]
  ? ObjValueTuple<T, KT, [...R, T[K & keyof T]]>
  : R;

type RecordToFields<O extends Record<string, Type>> = ObjValueTuple<{
  [K in keyof O]: classes.KeyType<K extends string ? K : never, O[K]>;
}>;

export class TypeBuilder {
  constructor(public system?: classes.ModuleType) {}

  // -------------------------------------------------------------- empty types

  get any() {
    return this.Any();
  }

  get undef() {
    return this.Const<undefined>(undefined);
  }

  get nil() {
    return this.Const<null>(null);
  }

  get bool() {
    return this.Boolean();
  }

  get num() {
    return this.Number();
  }

  get str() {
    return this.String();
  }

  get bin() {
    return this.Binary(this.any);
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

  get fn() {
    return this.Function(this.undef, this.undef);
  }

  get fn$() {
    return this.Function$(this.undef, this.undef);
  }

  // --------------------------------------------------------------- shorthands

  public readonly or = <F extends Type[]>(...types: F) => this.Or(...types);
  public readonly undefined = () => this.undef;
  public readonly null = () => this.nil;
  public readonly boolean = () => this.bool;
  public readonly number = () => this.num;
  public readonly string = () => this.str;
  public readonly binary = () => this.bin;

  public readonly con = <V>(value: schema.Narrow<V>, options?: schema.Optional<schema.ConSchema>) =>
    this.Const(value, options);
  public readonly literal = this.con;

  public readonly array = <T>(type?: T, options?: schema.Optional<schema.ArrSchema>) =>
    this.Array<T extends Type ? T : classes.AnyType>(
      (type ?? this.any) as T extends Type ? T : classes.AnyType,
      options,
    );

  public readonly tuple = <F extends Type[]>(...types: F) => this.Tuple(types);

  /**
   * Creates an object type with the specified properties. This is a shorthand for
   * `t.Object(t.prop(key, value), ...)`.
   *
   * Importantly, this method does not allow to specify object field order,
   * so the order of properties in the resulting type is not guaranteed.
   *
   * Example:
   *
   * ```ts
   * t.object({
   *   id: t.str,
   *   name: t.string(),
   *   age: t.num,
   *   verified: t.bool,
   * });
   * ```
   *
   * @param record A mapping of property names to types.
   * @returns An object type.
   */
  public readonly object = <R extends Record<string, Type>>(record: R): classes.ObjType<RecordToFields<R>> => {
    const keys: classes.KeyType<any, any>[] = [];
    for (const [key, value] of Object.entries(record)) keys.push(this.Key(key, value));
    return new classes.ObjType<RecordToFields<R>>(keys as any).sys(this.system);
  };

  /**
   * Creates a type that represents a value that may be present or absent. The
   * value is `undefined` if absent. This is a shorthand for `t.Or(type, t.undef)`.
   */
  public readonly maybe = <T extends Type>(type: T) => this.Or(type, this.undef);

  /**
   * Creates a union type from a list of values. This is a shorthand for
   * `t.Or(t.Const(value1), t.Const(value2), ...)`. For example, the below
   * are equivalent:
   *
   * ```ts
   * t.enum('red', 'green', 'blue');
   * t.Or(t.Const('red'), t.Const('green'), t.Const('blue'));
   * ```
   *
   * @param values The values to include in the union.
   * @returns A union type representing the values.
   */
  public readonly enum = <const T extends (string | number | boolean | null)[]>(
    ...values: T
  ): classes.OrType<{[K in keyof T]: classes.ConType<schema.Narrow<T[K]>>}> =>
    this.Or(...values.map((type) => this.Const(type as any))) as any;

  // --------------------------------------------------- base node constructors

  public Any(options?: schema.Optional<schema.AnySchema>) {
    return new classes.AnyType(s.Any(options)).sys(this.system);
  }

  public Const<const V>(value: schema.Narrow<V>, options?: schema.Optional<schema.ConSchema>) {
    type V2 = string extends V
      ? never
      : number extends V
        ? never
        : boolean extends V
          ? never
          : any[] extends V
            ? never
            : V;
    return new classes.ConType<V2>(schema.s.Const(value, options)).sys(this.system);
  }

  public Boolean(options?: schema.Optional<schema.BoolSchema>) {
    return new classes.BoolType(s.Boolean(options)).sys(this.system);
  }

  public Number(options?: schema.Optional<schema.NumSchema>) {
    return new classes.NumType(s.Number(options)).sys(this.system);
  }

  public String(options?: schema.Optional<schema.StrSchema>) {
    return new classes.StrType(s.String(options)).sys(this.system);
  }

  public Binary<T extends Type>(type: T, options: schema.Optional<schema.BinSchema> = {}) {
    return new classes.BinType(type, options).sys(this.system);
  }

  public Array<T extends Type>(type: T, options?: schema.Optional<schema.ArrSchema>) {
    return new classes.ArrType<T, [], []>(type, void 0, void 0, options).sys(this.system);
  }

  public Tuple<const Head extends Type[], Item extends Type | void = undefined, const Tail extends Type[] = []>(
    head: Head,
    item?: Item,
    tail?: Tail,
    options?: schema.Optional<schema.ArrSchema>,
  ) {
    return new classes.ArrType(item, head, tail, options).sys(this.system);
  }

  public Object<F extends (classes.KeyType<any, any> | classes.KeyOptType<any, any>)[]>(...keys: F) {
    return new classes.ObjType<F>(keys).sys(this.system);
  }

  public Key<K extends string, V extends Type>(key: K, value: V) {
    return new classes.KeyType<K, V>(key, value).sys(this.system);
  }

  public KeyOpt<K extends string, V extends Type>(key: K, value: V) {
    return new classes.KeyOptType<K, V>(key, value).sys(this.system);
  }

  public Map<T extends Type>(val: T, key?: Type, options?: schema.Optional<schema.MapSchema>) {
    return new classes.MapType<T>(val, key, options).sys(this.system);
  }

  public Or<F extends Type[]>(...types: F) {
    return new classes.OrType<F>(types).sys(this.system);
  }

  public Ref<T extends Type | classes.AliasType<any, any>>(ref: string) {
    return new classes.RefType<TypeOfAlias<T>>(ref).sys(this.system);
  }

  public Function<Req extends Type, Res extends Type, Ctx = unknown>(
    req: Req,
    res: Res,
    options?: schema.Optional<schema.FnSchema>,
  ) {
    return new classes.FnType<Req, Res, Ctx>(req, res, options).sys(this.system);
  }

  public Function$<Req extends Type, Res extends Type, Ctx = unknown>(
    req: Req,
    res: Res,
    options?: schema.Optional<schema.FnRxSchema>,
  ) {
    return new classes.FnRxType<Req, Res, Ctx>(req, res, options).sys(this.system);
  }

  public import(node: schema.Schema): Type {
    switch (node.kind) {
      case 'any':
        return this.Any(node);
      case 'bool':
        return this.Boolean(node);
      case 'num':
        return this.Number(node);
      case 'str':
        return this.String(node);
      case 'bin':
        return this.Binary(this.import(node.type), node);
      case 'arr': {
        const {head, type, tail, ...rest} = node as schema.ArrSchema;
        return this.Tuple(
          head ? head.map((h: any) => this.import(h)) : void 0,
          type ? this.import(type) : void 0,
          tail ? tail.map((t: any) => this.import(t)) : void 0,
          rest,
        );
      }
      case 'obj': {
        const fields = node.keys.map((f: any) =>
          f.optional
            ? this.KeyOpt(f.key, this.import(f.value)).options(f)
            : this.Key(f.key, this.import(f.value)).options(f),
        );
        return this.Object(...fields).options(node);
      }
      case 'key':
        return node.optional
          ? this.KeyOpt(node.key, this.import(node.value as schema.Schema)).options(node)
          : this.Key(node.key, this.import(node.value as schema.Schema)).options(node);
      case 'map':
        return this.Map(this.import(node.value), node.key ? this.import(node.key) : undefined, node);
      case 'con':
        return this.Const(node.value).options(node);
      case 'or':
        return this.Or(...node.types.map((t) => this.import(t as schema.Schema))).options(node);
      case 'ref':
        return this.Ref(node.ref).options(node);
      case 'fn':
        return this.Function(this.import(node.req as schema.Schema), this.import(node.res as schema.Schema)).options(
          node,
        );
      case 'fn$':
        return this.Function$(this.import(node.req as schema.Schema), this.import(node.res as schema.Schema)).options(
          node,
        );
    }
    throw new Error(`UNKNOWN_NODE [${node.kind}]`);
  }

  public from(value: unknown): Type {
    switch (typeof value) {
      case 'undefined':
        return this.undef;
      case 'boolean':
        return this.bool;
      case 'number':
        return this.num;
      case 'string':
        return this.str;
      case 'object':
        if (value === null) return this.nil;
        if (Array.isArray(value)) {
          if (value.length === 0) return this.arr;
          const getType = (v: unknown): string => this.from(v) + '';
          const allElementsOfTheSameType = value.every((v) => getType(v) === getType(value[0]));
          this.Array(this.from(value[0]));
          return allElementsOfTheSameType
            ? this.Array(this.from(value[0]))
            : this.tuple(...value.map((v) => this.from(v)));
        }
        return this.Object(...Object.entries(value).map(([key, value]) => this.Key(key, this.from(value))));
      default:
        return this.any;
    }
  }
}
