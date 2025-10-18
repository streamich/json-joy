import {RandomJson, randomString} from '@jsonjoy.com/json-random';
import {cloneBinary} from '@jsonjoy.com/util/lib/json-clone';
import {of} from 'rxjs';
import type {
  AbsType,
  AnyType,
  ArrType,
  BinType,
  BoolType,
  ConType,
  FnRxType,
  FnType,
  MapType,
  NumType,
  OrType,
  RefType,
  StrType,
  Type,
  t,
} from '../type';
import {KeyOptType, type KeyType, type ObjType} from '../type/classes/ObjType';

export class Random {
  public static readonly gen = <T extends Type>(type: T): t.infer<T> => {
    const generator = new Random();
    return generator.gen(type) as any;
  };

  public gen(type: AbsType<any>): unknown {
    const kind = type.kind();
    switch (kind) {
      case 'any':
        return this.any(type);
      case 'arr':
        return this.arr(type as ArrType<any, any, any>);
      case 'bin':
        return this.bin(type as BinType<any>);
      case 'bool':
        return this.bool(type as BoolType);
      case 'con':
        return this.con(type as ConType);
      case 'fn':
        return this.fn(type as FnType<any, any>);
      case 'fn$':
        return this.fn$(type as FnRxType<any, any>);
      case 'map':
        return this.map(type as MapType<any>);
      case 'num':
        return this.num(type as NumType);
      case 'obj':
        return this.obj(type as ObjType<any>);
      case 'or':
        return this.or(type as OrType<any>);
      case 'ref':
        return this.ref(type as RefType<any>);
      case 'str':
        return this.str(type as StrType);
      default:
        throw new Error(`Unsupported type kind: ${kind}`);
    }
  }

  public any(type: AnyType): unknown {
    return RandomJson.generate({nodeCount: 5});
  }

  public arr(type: ArrType<any, any, any>): unknown[] {
    let length = Math.round(Math.random() * 10);
    const schema = type.getSchema();
    const {min, max} = schema;
    if (min !== undefined && length < min) length = min + length;
    if (max !== undefined && length > max) length = max;
    const result: unknown[] = [];
    if (type._head) for (const childType of type._head) result.push(this.gen(childType));
    const elementType = type._type;
    if (elementType) for (let i = 0; i < length; i++) result.push(this.gen(elementType));
    if (type._tail) for (const childType of type._tail) result.push(this.gen(childType));
    return result;
  }

  public bin(type: BinType<any>): Uint8Array {
    const octets = RandomJson.genString()
      .split('')
      .map((c) => c.charCodeAt(0));
    return new Uint8Array(octets);
  }

  public bool(type: BoolType): boolean {
    return RandomJson.genBoolean();
  }

  public con(type: ConType): unknown {
    return cloneBinary(type.getSchema().value);
  }

  public fn(type: FnType<any, any>): unknown {
    return async () => this.gen(type.res);
  }

  public fn$(type: FnRxType<any, any>): unknown {
    return of(this.gen(type.res));
  }

  public map(type: MapType<any>): Record<string, unknown> {
    const length = Math.round(Math.random() * 10);
    const res: Record<string, unknown> = {};
    for (let i = 0; i < length; i++) res[RandomJson.genString(length)] = this.gen(type._value);
    return res;
  }

  public num(type: NumType): number {
    let num = Math.random();
    let min = Number.MIN_SAFE_INTEGER;
    let max = Number.MAX_SAFE_INTEGER;
    const schema = type.getSchema();
    const {lt, lte, gt, gte} = schema;
    if (gt !== undefined) min = gt;
    if (gte !== undefined)
      if (gte === lte) return gte;
      else min = gte + 0.000000000000001;
    if (lt !== undefined) max = lt;
    if (lte !== undefined) max = lte - 0.000000000000001;
    if (min >= max) return max;
    if (schema.format) {
      switch (schema.format) {
        case 'i8':
          min = Math.max(min, -0x80);
          max = Math.min(max, 0x7f);
          break;
        case 'i16':
          min = Math.max(min, -0x8000);
          max = Math.min(max, 0x7fff);
          break;
        case 'i32':
          min = Math.max(min, -0x80000000);
          max = Math.min(max, 0x7fffffff);
          break;
        case 'i64':
        case 'i':
          min = Math.max(min, -0x8000000000);
          max = Math.min(max, 0x7fffffffff);
          break;
        case 'u8':
          min = Math.max(min, 0);
          max = Math.min(max, 0xff);
          break;
        case 'u16':
          min = Math.max(min, 0);
          max = Math.min(max, 0xffff);
          break;
        case 'u32':
          min = Math.max(min, 0);
          max = Math.min(max, 0xffffffff);
          break;
        case 'u64':
        case 'u':
          min = Math.max(min, 0);
          max = Math.min(max, 0xffffffffffff);
          break;
      }
      return Math.round(num * (max - min)) + min;
    }
    num = num * (max - min) + min;
    if (Math.random() > 0.7) num = Math.round(num);
    if (num === 0) return 0;
    return num;
  }

  public obj(type: ObjType<any>): Record<string, unknown> {
    const schema = type.getSchema();
    const obj: Record<string, unknown> = schema.decodeUnknownKeys
      ? <Record<string, unknown>>RandomJson.genObject()
      : {};
    for (const f of type.keys) {
      const field = f as KeyType<any, any>;
      const isOptional = field instanceof KeyOptType;
      if (isOptional && Math.random() > 0.5) continue;
      obj[field.key] = this.gen(field.val);
    }
    return obj;
  }

  public or(type: OrType<any>): unknown {
    const types = (type as any).types;
    const index = Math.floor(Math.random() * types.length);
    return this.gen(types[index]);
  }

  public ref(type: RefType<any>): unknown {
    if (!type.system) throw new Error('NO_SYSTEM');
    const alias = type.system.resolve(type.getSchema().ref);
    return this.gen(alias.type);
  }

  public str(type: StrType): string {
    const schema = type.getSchema();
    const isAscii = schema.format === 'ascii' || schema.ascii;
    const {min, max} = schema;
    let targetLength = Math.round(Math.random() * 10);
    if (min !== undefined && targetLength < min) targetLength = min + targetLength;
    if (max !== undefined && targetLength > max) targetLength = max;
    let str = isAscii ? randomString(['char', 32, 126, targetLength]) : RandomJson.genString(targetLength);
    const length = str.length;
    if (min !== undefined && length < min) str = str.padEnd(min, '.');
    if (max !== undefined && length > max) str = str.slice(0, max);
    return str;
  }
}
