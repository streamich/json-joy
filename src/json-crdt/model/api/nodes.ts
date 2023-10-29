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
import {printTree} from '../../../util/print/printTree';
import type * as types from '../proxy/types';
import type {JsonNode, JsonNodeView} from '../../types';
import type {ModelApi} from './ModelApi';
import type {Printable} from '../../../util/print/types';

export type ApiPath = string | number | Path | void;

/**
 * @category Local API
 */
export class NodeApi<N extends JsonNode = JsonNode> implements Printable {
  constructor(public readonly node: N, public readonly api: ModelApi<any>) {}

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
    if (this.node instanceof ValueLww) return this.api.wrap(this.node as ValueLww);
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
    if (this.node instanceof ArrayLww) return this.api.wrap(this.node as ArrayLww);
    throw new Error('NOT_ARR');
  }

  public asObj(): ObjectApi {
    if (this.node instanceof ObjectLww) return this.api.wrap(this.node as ObjectLww);
    throw new Error('NOT_OBJ');
  }

  public asConst(): ConstApi {
    if (this.node instanceof Const) return this.api.wrap(this.node);
    throw new Error('NOT_CONST');
  }

  public asExt<EN extends ExtensionJsonNode, V, EApi extends ExtensionApi<EN>>(
    ext: ExtensionDefinition<any, EN, EApi>,
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

  public view(): JsonNodeView<N> {
    return this.node.view() as unknown as JsonNodeView<N>;
  }

  public toString(tab: string = ''): string {
    return this.constructor.name + printTree(tab, [(tab) => this.node.toString(tab)]);
  }
}

/**
 * @category Local API
 */
export class ConstApi<N extends Const<any> = Const<any>> extends NodeApi<N> {
  public proxy(): types.ProxyNodeConst<N> {
    return {
      toApi: () => <any>this,
    };
  }
}

/**
 * @category Local API
 */
export class ValueApi<N extends ValueLww<any> = ValueLww<any>> extends NodeApi<N> {
  public set(json: JsonNodeView<N>): this {
    const {api, node} = this;
    const builder = api.builder;
    const val = builder.constOrJson(json);
    api.builder.setVal(node.id, val);
    api.apply();
    return this;
  }

  public proxy(): types.ProxyNodeVal<N> {
    const self = this;
    const proxy = {
      toApi: () => <any>this,
      get val() {
        const childNode = self.node.node();
        return (<any>self).api.wrap(childNode).proxy();
      },
    };
    return <any>proxy;
  }
}

/**
 * @category Local API
 */
export class TupleApi<N extends ArrayLww<any> = ArrayLww<any>> extends NodeApi<N> {
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

  public proxy(): types.ProxyNodeVec<N> {
    const proxy = new Proxy(
      {},
      {
        get: (target, prop, receiver) => {
          if (prop === 'toApi') return () => this;
          const index = Number(prop);
          if (Number.isNaN(index)) throw new Error('INVALID_INDEX');
          const child = this.node.get(index);
          if (!child) throw new Error('OUT_OF_BOUNDS');
          return (<any>this).api.wrap(child).proxy();
        },
      },
    );
    return proxy as types.ProxyNodeVec<N>;
  }
}

/**
 * @category Local API
 */
export class ObjectApi<N extends ObjectLww<any> = ObjectLww<any>> extends NodeApi<N> {
  public set(entries: Partial<JsonNodeView<N>>): this {
    const {api, node} = this;
    const {builder} = api;
    builder.insObj(
      node.id,
      Object.entries(entries).map(([key, json]) => [key, builder.constOrJson(json)]),
    );
    api.apply();
    return this;
  }

  public del(keys: string[]): this {
    const {api, node} = this;
    const {builder} = api;
    api.builder.insObj(
      node.id,
      keys.map((key) => [key, builder.const(undefined)]),
    );
    api.apply();
    return this;
  }

  public proxy(): types.ProxyNodeObj<N> {
    const self = this;
    const proxy = new Proxy(
      {},
      {
        get: (target, prop, receiver) => {
          if (prop === 'toApi') return () => self;
          const key = String(prop);
          const child = this.node.get(key);
          if (!child) throw new Error('NO_SUCH_KEY');
          return (<any>this).api.wrap(child).proxy();
        },
      },
    );
    return proxy as types.ProxyNodeObj<N>;
  }
}

/**
 * @category Local API
 */
export class StringApi extends NodeApi<StringRga> {
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

  public proxy(): types.ProxyNodeStr {
    return {
      toApi: () => this,
    };
  }
}

/**
 * @category Local API
 */
export class BinaryApi extends NodeApi<BinaryRga> {
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

  public proxy(): types.ProxyNodeBin {
    return {
      toApi: () => this,
    };
  }
}

/**
 * @category Local API
 */
export class ArrayApi<N extends ArrayRga<any> = ArrayRga<any>> extends NodeApi<N> {
  public ins(index: number, values: Array<JsonNodeView<N>[number]>): this {
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

  public proxy(): types.ProxyNodeArr<N> {
    const proxy = new Proxy(
      {},
      {
        get: (target, prop, receiver) => {
          if (prop === 'toApi') return () => this;
          const index = Number(prop);
          if (Number.isNaN(index)) throw new Error('INVALID_INDEX');
          const child = this.node.getNode(index);
          if (!child) throw new Error('OUT_OF_BOUNDS');
          return (this.api.wrap(child) as any).proxy();
        },
      },
    );
    return proxy as types.ProxyNodeArr<N>;
  }
}
