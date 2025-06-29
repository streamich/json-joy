import type {PatchBuilder} from './PatchBuilder';
import type {ITimestampStruct} from './clock';

/* tslint:disable no-namespace class-name */

export type NodeBuilderCallback = (builder: PatchBuilder) => ITimestampStruct;

/**
 * @category Patch
 */
export class NodeBuilder {
  constructor(public readonly build: NodeBuilderCallback) {}
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
  export class con<T extends unknown | ITimestampStruct> extends NodeBuilder {
    public readonly type = 'con';

    constructor(public readonly raw: T) {
      super((builder) => builder.const(raw));
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
  export class str<T extends string = string> extends NodeBuilder {
    public readonly type = 'str';

    constructor(public readonly raw: T) {
      super((builder) => builder.json(raw));
    }
  }

  /**
   * The `bin` class represents a "bin" JSON CRDT node.
   */
  export class bin extends NodeBuilder {
    public readonly type = 'bin';

    constructor(public readonly raw: Uint8Array) {
      super((builder) => builder.json(raw));
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
  export class val<T extends NodeBuilder> extends NodeBuilder {
    public readonly type = 'val';

    constructor(public readonly value: T) {
      super((builder) => {
        const valId = builder.val();
        const valueId = value.build(builder);
        builder.setVal(valId, valueId);
        return valId;
      });
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
  export class vec<T extends NodeBuilder[]> extends NodeBuilder {
    public readonly type = 'vec';

    constructor(public readonly value: T) {
      super((builder) => {
        const vecId = builder.vec();
        const length = value.length;
        if (length) {
          const elementPairs: [index: number, value: ITimestampStruct][] = [];
          for (let i = 0; i < length; i++) {
            const element = value[i];
            const elementId = element.build(builder);
            elementPairs.push([i, elementId]);
          }
          builder.insVec(vecId, elementPairs);
        }
        return vecId;
      });
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
    // biome-ignore lint: TODO: improve {} type in the future
    O extends Record<string, NodeBuilder> = {},
  > extends NodeBuilder {
    public readonly type = 'obj';

    constructor(
      public readonly obj: T,
      public readonly opt?: O,
    ) {
      super((builder) => {
        const objId = builder.obj();
        const keyValuePairs: [key: string, value: ITimestampStruct][] = [];
        const merged = {...obj, ...opt};
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
      });
    }

    public optional<OO extends Record<string, NodeBuilder>>(): obj<T, O & OO> {
      return this as unknown as obj<T, O & OO>;
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
  export class arr<T extends NodeBuilder> extends NodeBuilder {
    public readonly type = 'arr';

    constructor(public readonly arr: T[]) {
      super((builder) => {
        const arrId = builder.arr();
        const length = arr.length;
        if (length) {
          const valueIds: ITimestampStruct[] = [];
          for (let i = 0; i < length; i++) valueIds.push(arr[i].build(builder));
          builder.insArr(arrId, arrId, valueIds);
        }
        return arrId;
      });
    }
  }

  /**
   * Convenience class for recursively creating a node tree from any POJO. It
   * uses the {@link Builder.json} method to create a JSON node. It can be used
   * similar to TypeScript's *any* type, where the value can be anything.
   *
   * Example:
   *
   * ```typescript
   * s.json({name: 'Alice', age: 30});
   * ```
   */
  export class json<T> extends NodeBuilder {
    public readonly type = 'json';

    constructor(public readonly value: T) {
      super((builder) => builder.json(value));
    }
  }

  /**
   * Convenience class for recursively creating a node tree from any POJO. It
   * uses the {@link Builder.constOrJson} method to create a JSON node. It can
   * be used similar to TypeScript's *any* type, where the value can be anything.
   *
   * Example:
   *
   * ```typescript
   * s.jsonCon({name: 'Alice', age: 30});
   * ```
   */
  export class jsonCon<T> extends NodeBuilder {
    public readonly type = 'jsonCon';

    constructor(public readonly value: T) {
      super((builder) => builder.constOrJson(value));
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
  export class ext<ID extends number, T extends NodeBuilder> extends NodeBuilder {
    public readonly type = 'ext';

    /**
     * @param id A unique extension ID.
     * @param data Schema of the data node of the extension.
     */
    constructor(
      public readonly id: ID,
      public readonly data: T,
    ) {
      super((builder) => {
        const buf = new Uint8Array([id, 0, 0]);
        const tupleId = builder.vec();
        buf[1] = tupleId.sid % 256;
        buf[2] = tupleId.time % 256;
        builder.insVec(tupleId, [
          [0, builder.constOrJson(s.con(buf))],
          [1, data.build(builder)],
        ]);
        return tupleId;
      });
    }
  }
}
/* tslint:enable no-namespace class-name */

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
   * Recursively creates a node tree from any POJO. It uses the
   * {@link Builder.json} method to create a JSON node. It can be used similar
   * to TypeScript's *any* type, where the value can be anything.
   *
   * @param value Default value.
   */
  json: <T>(value: T) => new nodes.json<T>(value),

  /**
   * Recursively creates a node tree from any POJO. It uses the
   * {@link Builder.constOrJson} method to create a JSON node. It can be used
   * similar to TypeScript's *any* type, where the value can be anything.
   *
   * @param value Default value.
   */
  jsonCon: <T>(value: T) => new nodes.jsonCon<T>(value),

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
