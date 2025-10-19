import {isUint8Array} from '@jsonjoy.com/util/lib/buffers/isUint8Array';
import {Timestamp, type ITimestampStruct} from './clock';
import * as print from '../util/print';
import {printTree, type Printable} from 'tree-dump';
import type {PatchBuilder} from './PatchBuilder';

const maybeConst = (x: unknown): boolean => {
  switch (typeof x) {
    case 'number':
    case 'boolean':
    case 'undefined':
      return true;
    case 'object':
      return x === null || x instanceof Timestamp;
    default:
      return false;
  }
};

/**
 * @category Patch
 */
export class NodeBuilder {
  constructor(public readonly _build?: (builder: PatchBuilder) => ITimestampStruct) {}

  public build(builder: PatchBuilder): ITimestampStruct {
    return this._build?.(builder) ?? builder.con(void 0);
  }
}

/**
 * @category Patch
 */
export abstract class SchemaNode extends NodeBuilder implements Printable {
  // TODO: Rename to `kind` or `name`?
  public abstract readonly type: string;
  public abstract build(builder: PatchBuilder): ITimestampStruct;

  public toString(tab?: string): string {
    return this.type;
  }
}

/**
 * This namespace contains all the node builders. Each node builder is a
 * schema for a specific node type. Each node builder has a `build` method
 * that takes a {@link NodeBuilder} and returns the ID of the node.
 */
export namespace nodes {
  /**
   * The `con` class represents a "con" JSON CRDT node. As the generic type
   * parameter, it takes the type of the raw value.
   *
   * Example:
   *
   * ```ts
   * s.con(0);
   * s.con('');
   * s.con<number>(123);
   * s.con<0 | 1>(0);
   * ```
   */
  export class con<T extends unknown | ITimestampStruct> extends SchemaNode {
    public readonly type = 'con';

    constructor(public readonly raw: T) {
      super();
    }

    public build(builder: PatchBuilder): ITimestampStruct {
      return builder.con(this.raw);
    }

    public toString(tab?: string): string {
      return this.type + ' ' + print.con(this.raw);
    }
  }

  /**
   * The `str` class represents a "str" JSON CRDT node. As the generic type
   * parameter, it takes the type of the raw value.
   *
   * Example:
   *
   * ```ts
   * s.str('');
   * s.str('hello');
   * s.str<string>('world');
   * s.str<'' | 'hello' | 'world'>('hello');
   * ```
   */
  export class str<T extends string = string> extends SchemaNode {
    public readonly type = 'str';

    constructor(public readonly raw: T) {
      super();
    }

    public build(builder: PatchBuilder): ITimestampStruct {
      return builder.json(this.raw);
    }

    public toString(tab?: string): string {
      return this.type + ' ' + print.con(this.raw);
    }
  }

  /**
   * The `bin` class represents a "bin" JSON CRDT node.
   */
  export class bin extends SchemaNode {
    public readonly type = 'bin';

    constructor(public readonly raw: Uint8Array) {
      super();
    }

    public build(builder: PatchBuilder): ITimestampStruct {
      return builder.json(this.raw);
    }

    public toString(tab?: string): string {
      return this.type + ' ' + print.bin(this.raw);
    }
  }

  /**
   * The `val` class represents a "val" JSON CRDT node. As the generic type
   * parameter, it takes the type of the inner node builder.
   *
   * Example:
   *
   * ```ts
   * s.val(s.con(0));
   * s.val(s.str(''));
   * s.val(s.str('hello'));
   * ```
   */
  export class val<T extends NodeBuilder> extends SchemaNode {
    public readonly type = 'val';

    constructor(public readonly value: T) {
      super();
    }

    public build(builder: PatchBuilder): ITimestampStruct {
      const valId = builder.val();
      const valueId = this.value.build(builder);
      builder.setVal(valId, valueId);
      return valId;
    }

    public toString(tab?: string): string {
      return this.type + printTree(tab, [(tab) => (this.value as {} as SchemaNode).toString(tab)]);
    }
  }

  /**
   * The `vec` class represents a "vec" JSON CRDT node. As the generic type
   * parameter, it takes a tuple of node builders.
   *
   * Example:
   *
   * ```ts
   * s.vec(s.con(0), s.con(1));
   * s.vec(s.str(''), s.str('hello'));
   * ```
   */
  export class vec<T extends (NodeBuilder | undefined)[]> extends SchemaNode {
    public readonly type = 'vec';

    constructor(public readonly value: T) {
      super();
    }

    public build(builder: PatchBuilder): ITimestampStruct {
      const vecId = builder.vec();
      const value = this.value;
      const length = value.length;
      if (length) {
        const elementPairs: [index: number, value: ITimestampStruct][] = [];
        for (let i = 0; i < length; i++) {
          const element = value[i];
          if (!element) continue;
          const elementId = element.build(builder);
          elementPairs.push([i, elementId]);
        }
        builder.insVec(vecId, elementPairs);
      }
      return vecId;
    }

    public toString(tab?: string): string {
      return (
        this.type +
        printTree(tab, [
          ...this.value.map(
            (child, i) => (tab: string) =>
              `${i}: ${child ? (child as {} as SchemaNode).toString(tab) : print.line(child)}`,
          ),
        ])
      );
    }
  }

  /**
   * The `obj` class represents a "obj" JSON CRDT node. As the generic type
   * parameter, it takes a record of node builders. The optional generic type
   * parameter is a record of optional keys.
   *
   * Example:
   *
   * ```ts
   * s.obj({
   *   name: s.str(''),
   *   age: s.con(0),
   * });
   * ```
   *
   * Specify optional keys as the second argument:
   *
   * ```ts
   * s.obj(
   *   {
   *     href: s.str('https://example.com'),
   *   },
   *   {
   *     title: s.str(''),
   *   },
   * )
   * ```
   *
   * Or, specify only the type, using the `optional` method:
   *
   * ```ts
   * s.obj({
   *   href: s.str('https://example.com'),
   * })
   *   .optional<nodes.obj({
   *     title: nodes.str,
   *   })>()
   * ```
   */
  export class obj<
    T extends Record<string, NodeBuilder>,
    O extends Record<string, NodeBuilder> = {},
  > extends SchemaNode {
    public readonly type = 'obj';

    constructor(
      public readonly obj: T,
      public readonly opt?: O,
    ) {
      super();
    }

    public optional<OO extends Record<string, NodeBuilder>>(): obj<T, O & OO> {
      return this as unknown as obj<T, O & OO>;
    }

    public build(builder: PatchBuilder): ITimestampStruct {
      const objId = builder.obj();
      const keyValuePairs: [key: string, value: ITimestampStruct][] = [];
      const merged = {...this.obj, ...this.opt};
      const keys = Object.keys(merged);
      const length = keys.length;
      if (length) {
        for (let i = 0; i < length; i++) {
          const key = keys[i];
          const valueId = merged[key].build(builder);
          keyValuePairs.push([key, valueId]);
        }
        builder.insObj(objId, keyValuePairs);
      }
      return objId;
    }

    public toString(tab: string = ''): string {
      return (
        this.type +
        printTree(tab, [
          ...[...Object.entries(this.obj)].map(
            ([key, child]) =>
              (tab: string) =>
                print.line(key) + printTree(tab + ' ', [(tab) => (<SchemaNode>child).toString(tab)]),
          ),
          ...[...Object.entries(this.opt ?? [])].map(
            ([key, child]) =>
              (tab: string) =>
                print.line(key) + '?' + printTree(tab + ' ', [(tab) => (<SchemaNode>child).toString(tab)]),
          ),
        ])
      );
    }
  }

  /**
   * A type alias for {@link obj}. It creates a "map" node schema, which is an
   * object where a key can be any string and the value is of the same type.
   *
   * Example:
   *
   * ```ts
   * s.map<nodes.con<number>>
   * ```
   */
  export type map<R extends NodeBuilder> = obj<Record<string, R>, Record<string, R>>;

  /**
   * The `arr` class represents a "arr" JSON CRDT node. As the generic type
   * parameter, it an array of node builders.
   *
   * Example:
   *
   * ```ts
   * s.arr([s.con(0), s.con(1)]);
   * s.arr([s.str(''), s.str('hello')]);
   * ```
   */
  export class arr<T extends NodeBuilder> extends SchemaNode {
    public readonly type = 'arr';

    constructor(public readonly arr: T[]) {
      super();
    }

    public build(builder: PatchBuilder): ITimestampStruct {
      const arrId = builder.arr();
      const arr = this.arr;
      const length = arr.length;
      if (length) {
        const valueIds: ITimestampStruct[] = [];
        for (let i = 0; i < length; i++) valueIds.push(arr[i].build(builder));
        builder.insArr(arrId, arrId, valueIds);
      }
      return arrId;
    }

    public toString(tab?: string): string {
      return (
        this.type +
        printTree(tab, [
          ...this.arr.map(
            (child, i) => (tab: string) =>
              `[${i}]: ${child ? (child as {} as SchemaNode).toString(tab) : print.line(child)}`,
          ),
        ])
      );
    }
  }

  /**
   * Creates an extension node schema. The extension node is a tuple with a
   * sentinel header and a data node. The sentinel header is a 3-byte
   * {@link Uint8Array}, which makes this "vec" node to be treated as an
   * extension "ext" node.
   *
   * The 3-byte header consists of the extension ID, the SID of the tuple ID,
   * and the time of the tuple ID:
   *
   * - 1 byte for the extension id
   * - 1 byte for the sid of the tuple id, modulo 256
   * - 1 byte for the time of the tuple id, modulo 256
   */
  export class ext<ID extends number, T extends NodeBuilder> extends SchemaNode {
    public readonly type = 'ext';

    /**
     * @param id A unique extension ID.
     * @param data Schema of the data node of the extension.
     */
    constructor(
      public readonly id: ID,
      public readonly data: T,
    ) {
      super();
    }

    public build(builder: PatchBuilder): ITimestampStruct {
      const buf = new Uint8Array([this.id, 0, 0]);
      const tupleId = builder.vec();
      buf[1] = tupleId.sid % 256;
      buf[2] = tupleId.time % 256;
      builder.insVec(tupleId, [
        [0, builder.constOrJson(s.con(buf))],
        [1, this.data.build(builder)],
      ]);
      return tupleId;
    }

    public toString(tab?: string): string {
      return this.type + '(' + this.id + ')' + printTree(tab, [(tab) => (this.data as {} as SchemaNode).toString(tab)]);
    }
  }

  /**
   * Converts a POJO value to a JSON CRDT node schema. It recursively converts
   * the value to a node schema, where each property is a node builder.
   */
  export type json<V> = V extends NodeBuilder
    ? V
    : V extends Array<infer T>
      ? nodes.arr<json<T>>
      : V extends Uint8Array
        ? nodes.bin
        : V extends Record<string, any>
          ? nodes.obj<{[K in keyof V]: jsonCon<V[K]>}>
          : V extends string
            ? nodes.str<V>
            : V extends boolean
              ? nodes.val<nodes.con<boolean>>
              : nodes.val<nodes.con<V>>;

  /**
   * Same as {@link json}, but converts constant values to
   * {@link nodes.con} nodes, instead wrapping them into {@link nodes.val} nodes.
   */
  export type jsonCon<V> = V extends number
    ? nodes.con<V>
    : V extends boolean
      ? nodes.con<V>
      : V extends null
        ? nodes.con<V>
        : V extends undefined
          ? nodes.con<V>
          : V extends ITimestampStruct
            ? nodes.val<nodes.con<V>>
            : json<V>;
}

/**
 * Schema builder. Use this to create a JSON CRDT model schema and the default
 * value.
 *
 * Example:
 *
 * ```typescript
 * const schema = s.obj({
 *   name: s.str(''),
 *   age: s.con(0),
 *   tags: s.arr<nodes.con<string>>([]),
 * });
 * ```
 */
export const schema = {
  /**
   * Creates a "con" node schema and the default value.
   *
   * @param raw Raw default value.
   */
  con: <T extends unknown | ITimestampStruct>(raw: T) => new nodes.con<T>(raw),

  /**
   * Creates a "str" node schema and the default value.
   *
   * @param str Default value.
   */
  str: <T extends string>(str: T) => new nodes.str<T>(str || ('' as T)),

  /**
   * Creates a "bin" node schema and the default value.
   *
   * @param bin Default value.
   */
  bin: (bin: Uint8Array) => new nodes.bin(bin),

  /**
   * Creates a "val" node schema and the default value.
   *
   * @param val Default value.
   */
  val: <T extends NodeBuilder>(val: T) => new nodes.val<T>(val),

  /**
   * Creates a "vec" node schema and the default value.
   *
   * @param vec Default value.
   */
  vec: <T extends NodeBuilder[]>(...vec: T) => new nodes.vec<T>(vec),

  /**
   * Creates a "obj" node schema and the default value.
   *
   * @param obj Default value, required object keys.
   * @param opt Default value of optional object keys.
   */
  obj: <T extends Record<string, NodeBuilder>, O extends Record<string, NodeBuilder>>(obj: T, opt?: O) =>
    new nodes.obj<T, O>(obj, opt),

  /**
   * This is an alias for {@link schema.obj}. It creates a "map" node schema,
   * which is an object where a key can be any string and the value is of the
   * same type.
   *
   * @param obj Default value.
   */
  map: <R extends NodeBuilder>(obj: Record<string, R>): nodes.map<R> =>
    schema.obj<Record<string, R>, Record<string, R>>(obj),

  /**
   * Creates an "arr" node schema and the default value.
   *
   * @param arr Default value.
   */
  arr: <T extends NodeBuilder>(arr: T[]) => new nodes.arr<T>(arr),

  /**
   * Recursively creates a node tree from any POJO.
   */
  json: <T>(value: T): nodes.json<T> => {
    switch (typeof value) {
      case 'object': {
        if (!value) return s.val(s.con(value)) as any;
        if (value instanceof NodeBuilder) return value as any;
        else if (Array.isArray(value)) return s.arr(value.map((v) => s.json(v))) as any;
        else if (isUint8Array(value)) return s.bin(value) as any;
        else if (value instanceof Timestamp) return s.val(s.con(value)) as any;
        else {
          const obj: Record<string, NodeBuilder> = {};
          const keys = Object.keys(value);
          for (const key of keys) obj[key] = s.jsonCon((value as any)[key]);
          return s.obj(obj) as any;
        }
      }
      case 'string':
        return s.str(value) as any;
      default:
        return s.val(s.con(value)) as any;
    }
  },

  /**
   * Recursively creates a schema node tree from any POJO. Same as {@link json}, but
   * converts constant values to {@link nodes.con} nodes, instead wrapping them into
   * {@link nodes.val} nodes.
   *
   * @todo Remove this once "arr" RGA supports in-place updates.
   */
  jsonCon: <T>(value: T): nodes.jsonCon<T> => {
    return maybeConst(value) ? (s.con(value) as any) : (s.json(value) as any);
  },

  /**
   * Creates an extension node schema.
   *
   * @param id A unique extension ID.
   * @param data Schema of the data node of the extension.
   */
  ext: <ID extends number, T extends NodeBuilder>(id: ID, data: T) => new nodes.ext<ID, T>(id, data),
};

/**
 * Schema builder. Use this to create a JSON CRDT model schema and the default
 * value. Alias for {@link schema}.
 */
export const s = schema;
