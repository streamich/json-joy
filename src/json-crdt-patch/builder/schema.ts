import type {ITimestampStruct} from '../clock';
import {NodeBuilder} from './DelayedValueBuilder';

/* tslint:disable no-namespace class-name */
export namespace nodes {
  export class con<T extends unknown | ITimestampStruct> extends NodeBuilder {
    public readonly type = 'con';

    constructor(public readonly raw: T) {
      super((builder) => builder.const(raw));
    }
  }

  export class str<T extends string = string> extends NodeBuilder {
    public readonly type = 'str';

    constructor(public readonly raw: T) {
      super((builder) => builder.json(raw));
    }
  }

  export class bin extends NodeBuilder {
    public readonly type = 'bin';

    constructor(public readonly raw: Uint8Array) {
      super((builder) => builder.json(raw));
    }
  }

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

  export class obj<
    T extends Record<string, NodeBuilder>,
    O extends Record<string, NodeBuilder> = {},
  > extends NodeBuilder {
    public readonly type = 'obj';

    constructor(public readonly obj: T, public readonly opt?: O) {
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

  export type map<R extends NodeBuilder> = obj<Record<string, R>, Record<string, R>>;

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
}
/* tslint:enable no-namespace class-name */

export const schema = {
  con: <T extends unknown | ITimestampStruct>(raw: T) => new nodes.con<T>(raw),
  str: <T extends string>(str: T) => new nodes.str<T>(str || ('' as T)),
  bin: (bin: Uint8Array) => new nodes.bin(bin),
  val: <T extends NodeBuilder>(val: T) => new nodes.val<T>(val),
  vec: <T extends NodeBuilder[]>(...vec: T) => new nodes.vec<T>(vec),
  obj: <T extends Record<string, NodeBuilder>, O extends Record<string, NodeBuilder>>(obj: T, opt?: O) =>
    new nodes.obj<T, O>(obj, opt),
  map: <R extends NodeBuilder>(obj: Record<string, R>): nodes.map<R> =>
    schema.obj<Record<string, R>, Record<string, R>>(obj),
  arr: <T extends NodeBuilder>(arr: T[]) => new nodes.arr<T>(arr),
};

export const s = schema;
