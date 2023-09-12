import {ArrayRga} from '../../types/rga-array/ArrayRga';
import {BinaryRga} from '../../types/rga-binary/BinaryRga';
import {Const} from '../../types/const/Const';
import {find} from './find';
import {ITimestampStruct, Timestamp} from '../../../json-crdt-patch/clock';
import {ObjectLww} from '../../types/lww-object/ObjectLww';
import {Path} from '../../../json-pointer';
import {StringRga} from '../../types/rga-string/StringRga';
import {ValueLww} from '../../types/lww-value/ValueLww';
import {ArrayLww} from '../../types/lww-array/ArrayLww';
import {ExtensionApi, ExtensionDefinition, ExtensionJsonNode} from '../../extensions/types';
import {NodeEvents} from './events/NodeEvents';
import type {JsonNode} from '../../types';
import type {ModelApi} from './ModelApi';

export type ApiPath = string | number | Path | void;

export class NodeApi<N extends JsonNode = JsonNode, View = unknown> {
  constructor(public readonly node: N, public readonly api: ModelApi) {}

  private ev: undefined | NodeEvents = undefined;
  public get events(): NodeEvents {
    const et = this.ev;
    return et || (this.ev = new NodeEvents(this));
  }

  public find(path?: ApiPath): JsonNode {
    const node = this.node;
    if (path === undefined) {
      if (typeof node.child === 'function') {
        const child = node.child();
        if (!child) throw new Error('NO_CHILD');
        return child;
      }
      throw new Error('CANNOT_IN');
    }
    if (typeof path === 'string' && !!path && path[0] !== '/') path = '/' + path;
    if (typeof path === 'number') path = [path];
    return find(this.node, path);
  }

  public in(path?: ApiPath) {
    const node = this.find(path);
    return this.api.wrap(node as any);
  }

  public asVal(): ValueApi {
    if (this.node instanceof ValueLww) return this.api.wrap(this.node);
    throw new Error('NOT_VAL');
  }

  public asStr(): StringApi {
    if (this.node instanceof StringRga) return this.api.wrap(this.node);
    throw new Error('NOT_STR');
  }

  public asBin(): BinaryApi {
    if (this.node instanceof BinaryRga) return this.api.wrap(this.node);
    throw new Error('NOT_BIN');
  }

  public asArr(): ArrayApi {
    if (this.node instanceof ArrayRga) return this.api.wrap(this.node);
    throw new Error('NOT_ARR');
  }

  public asTup(): TupleApi {
    if (this.node instanceof ArrayLww) return this.api.wrap(this.node);
    throw new Error('NOT_ARR');
  }

  public asObj(): ObjectApi {
    if (this.node instanceof ObjectLww) return this.api.wrap(this.node);
    throw new Error('NOT_OBJ');
  }

  public asConst(): ConstApi {
    if (this.node instanceof Const) return this.api.wrap(this.node);
    throw new Error('NOT_CONST');
  }

  public asExt<EN extends ExtensionJsonNode, V, EApi extends ExtensionApi<EN, V>>(
    ext: ExtensionDefinition<V, any, EN, EApi>,
  ): EApi {
    let node: JsonNode | undefined = this.node;
    while (node) {
      if (node instanceof ext.Node) return new ext.Api(node, this.api);
      node = node.child ? node.child() : undefined;
    }
    throw new Error('NOT_EXT');
  }

  public val(path?: ApiPath): ValueApi {
    return this.in(path).asVal();
  }

  public str(path?: ApiPath): StringApi {
    return this.in(path).asStr();
  }

  public bin(path?: ApiPath): BinaryApi {
    return this.in(path).asBin();
  }

  public arr(path?: ApiPath): ArrayApi {
    return this.in(path).asArr();
  }

  public tup(path?: ApiPath): TupleApi {
    return this.in(path).asTup();
  }

  public obj(path?: ApiPath): ObjectApi {
    return this.in(path).asObj();
  }

  public const(path?: ApiPath): ConstApi {
    return this.in(path).asConst();
  }

  public view(): View {
    return this.node.view() as unknown as View;
  }
}

export class ConstApi<T = unknown> extends NodeApi<Const, T> {}

export class ValueApi<T = unknown> extends NodeApi<ValueLww, T> {
  public set(json: T): this {
    const {api, node} = this;
    const builder = api.builder;
    const val = builder.constOrJson(json);
    api.builder.setVal(node.id, val);
    api.apply();
    return this;
  }
}

/** @todo Rename to `VectorApi`. */
export class TupleApi<T extends unknown[] = unknown[]> extends NodeApi<ArrayLww, T> {
  public set(entries: [index: number, value: unknown][]): this {
    const {api, node} = this;
    const {builder} = api;
    builder.insVec(
      node.id,
      entries.map(([index, json]) => [index, builder.constOrJson(json)]),
    );
    api.apply();
    return this;
  }
}

export class ObjectApi<T extends Record<string, unknown> = Record<string, unknown>> extends NodeApi<ObjectLww, T> {
  public set(entries: Partial<T>): this {
    const {api, node} = this;
    const {builder} = api;
    builder.setKeys(
      node.id,
      Object.entries(entries).map(([key, json]) => [key, builder.constOrJson(json)]),
    );
    api.apply();
    return this;
  }

  public del(keys: string[]): this {
    const {api, node} = this;
    const {builder} = api;
    api.builder.setKeys(
      node.id,
      keys.map((key) => [key, builder.const(undefined)]),
    );
    api.apply();
    return this;
  }
}

export class StringApi extends NodeApi<StringRga, string> {
  public ins(index: number, text: string): this {
    const {api, node} = this;
    const builder = api.builder;
    builder.pad();
    const nextTime = api.builder.nextTime();
    const id = new Timestamp(builder.clock.sid, nextTime);
    const after = node.insAt(index, id, text);
    if (!after) throw new Error('OUT_OF_BOUNDS');
    builder.insStr(node.id, after, text);
    api.advance();
    return this;
  }

  public del(index: number, length: number): this {
    const {api, node} = this;
    const builder = api.builder;
    builder.pad();
    const spans = node.findInterval(index, length);
    if (!spans) throw new Error('OUT_OF_BOUNDS');
    node.delete(spans);
    builder.del(node.id, spans);
    api.advance();
    return this;
  }
}

export class BinaryApi extends NodeApi<BinaryRga, Uint8Array> {
  public ins(index: number, data: Uint8Array): this {
    const {api, node} = this;
    const after = !index ? node.id : node.find(index - 1);
    if (!after) throw new Error('OUT_OF_BOUNDS');
    api.builder.insBin(node.id, after, data);
    api.apply();
    return this;
  }

  public del(index: number, length: number): this {
    const {api, node} = this;
    const spans = node.findInterval(index, length);
    if (!spans) throw new Error('OUT_OF_BOUNDS');
    api.builder.del(node.id, spans);
    api.apply();
    return this;
  }
}

export class ArrayApi<T = unknown> extends NodeApi<ArrayRga, T[]> {
  public ins(index: number, values: T[]): this {
    const {api, node} = this;
    const {builder} = api;
    const after = !index ? node.id : node.find(index - 1);
    if (!after) throw new Error('OUT_OF_BOUNDS');
    const valueIds: ITimestampStruct[] = [];
    for (let i = 0; i < values.length; i++) valueIds.push(builder.json(values[i]));
    builder.insArr(node.id, after, valueIds);
    api.apply();
    return this;
  }

  public del(index: number, length: number): this {
    const {api, node} = this;
    const spans = node.findInterval(index, length);
    if (!spans) throw new Error('OUT_OF_BOUNDS');
    api.builder.del(node.id, spans);
    api.apply();
    return this;
  }

  public length(): number {
    return this.node.length();
  }
}
