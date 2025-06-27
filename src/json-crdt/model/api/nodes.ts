import {printTree} from 'tree-dump/lib/printTree';
import {get} from '@jsonjoy.com/json-pointer/lib/get';
import {toPath} from '@jsonjoy.com/json-pointer/lib/util';
import {find} from './find';
import {type ITimestampStruct, Timestamp} from '../../../json-crdt-patch/clock';
import {ObjNode, ArrNode, BinNode, ConNode, VecNode, ValNode, StrNode, RootNode} from '../../nodes';
import {NodeEvents} from './NodeEvents';
import {ExtNode} from '../../extensions/ExtNode';
import type {Path} from '@jsonjoy.com/json-pointer';
import type {Extension} from '../../extensions/Extension';
import type {ExtApi} from '../../extensions/types';
import type {JsonNode, JsonNodeView} from '../../nodes';
import type * as types from './proxy';
import type {ModelApi} from './ModelApi';
import type {Printable} from 'tree-dump/lib/types';
import type {JsonNodeApi} from './types';
import type {VecNodeExtensionData} from '../../schema/types';

const breakPath = (path: ApiPath): [parent: Path | undefined, key: string | number] => {
  if (!path) return [void 0, ''];
  if (typeof path === 'number') return [void 0, path];
  if (typeof path === 'string') path = toPath(path);
  switch (path.length) {
    case 0:
      return [void 0, ''];
    case 1:
      return [void 0, path[0]];
    default: {
      const key = path[path.length - 1];
      const parent = path.slice(0, -1);
      return [parent, key];
    }
  }
};

export type ApiPath = string | number | Path | undefined;

/**
 * A generic local changes API for a JSON CRDT node.
 *
 * @category Local API
 */
export class NodeApi<N extends JsonNode = JsonNode, Extensions extends Extension<number, any, any, any, any>[] = []>
  implements Printable
{
  constructor(public node: N, public readonly api: ModelApi<any>) {}

  /** @ignore */
  private ev: undefined | NodeEvents<N> = undefined;

  /**
   * Event target for listening to node changes. You can subscribe to `"view"`
   * events, which are triggered every time the node's view changes.
   *
   * ```ts
   * node.events.on('view', () => {
   *   // do something...
   * });
   * ```
   */
  public get events(): NodeEvents<N> {
    const et = this.ev;
    return et || (this.ev = new NodeEvents<N>(this));
  }

  /**
   * Find a child node at the given path starting from this node.
   *
   * @param path Path to the child node to find.
   * @returns JSON CRDT node at the given path.
   */
  public find(path?: ApiPath): JsonNode {
    const node = this.node;
    if (path === undefined) {
      if (typeof node.child === 'function') {
        const child = node.child();
        if (!child) {
          if (node instanceof RootNode) return node;
          throw new Error('NO_CHILD');
        }
        return child;
      }
      throw new Error('CANNOT_IN');
    }
    if (typeof path === 'string' && !!path && path[0] !== '/') path = '/' + path;
    if (typeof path === 'number') path = [path];
    return find(this.node, path);
  }

  /**
   * Find a child node at the given path starting from this node and wrap it in
   * a local changes API.
   *
   * @param path Path to the child node to find.
   * @returns Local changes API for the child node at the given path.
   */
  public in(path?: ApiPath) {
    const node = this.find(path);
    return this.api.wrap(node as any);
  }

  public asVal(): ValApi {
    if (this.node instanceof ValNode) return this.api.wrap(this.node as ValNode);
    throw new Error('NOT_VAL');
  }

  public asStr(): StrApi {
    if (this.node instanceof StrNode) return this.api.wrap(this.node);
    throw new Error('NOT_STR');
  }

  public asBin(): BinApi {
    if (this.node instanceof BinNode) return this.api.wrap(this.node);
    throw new Error('NOT_BIN');
  }

  public asArr(): ArrApi {
    if (this.node instanceof ArrNode) return this.api.wrap(this.node);
    throw new Error('NOT_ARR');
  }

  public asVec(): VecApi {
    if (this.node instanceof VecNode) return this.api.wrap(this.node as VecNode);
    throw new Error('NOT_ARR');
  }

  public asObj(): ObjApi {
    if (this.node instanceof ObjNode) return this.api.wrap(this.node as ObjNode);
    throw new Error('NOT_OBJ');
  }

  public asCon(): ConApi {
    if (this.node instanceof ConNode) return this.api.wrap(this.node);
    throw new Error('NOT_CONST');
  }

  /**
   * Returns the API object of the extension if the node is an extension node.
   * When the `ext` parameter is provided, it checks if the node is an instance
   * of the given extension and returns the object's TypeScript type. Otherwise,
   * it returns the API object of the extension, but without any type checking.
   *
   * @param ext Extension of the node
   * @returns API of the extension
   */
  public asExt(): JsonNodeApi<VecNodeExtensionData<N>, Extensions> | ExtApi<any> | undefined;
  public asExt<EN extends ExtNode<any, any>, EApi extends ExtApi<EN>>(
    ext: Extension<any, any, EN, EApi, any, any>,
  ): EApi;
  public asExt<EN extends ExtNode<any, any>, EApi extends ExtApi<EN>>(
    ext?: Extension<any, any, EN, EApi, any, any>,
  ): EApi {
    let extNode: ExtNode<any> | undefined = undefined;
    const node: JsonNode | undefined = this.node;
    if (node instanceof ExtNode) extNode = node;
    if (node instanceof VecNode) extNode = node.ext();
    if (!extNode) throw new Error('NOT_EXT');
    const api = this.api.wrap(extNode);
    if (!ext) return api as any;
    if (api instanceof ext.Api) return api;
    throw new Error('NOT_EXT');
  }

  public val(path?: ApiPath): ValApi {
    return this.in(path).asVal();
  }

  public str(path?: ApiPath): StrApi {
    return this.in(path).asStr();
  }

  public bin(path?: ApiPath): BinApi {
    return this.in(path).asBin();
  }

  public arr(path?: ApiPath): ArrApi {
    return this.in(path).asArr();
  }

  public vec(path?: ApiPath): VecApi {
    return this.in(path).asVec();
  }

  public obj(path?: ApiPath): ObjApi {
    return this.in(path).asObj();
  }

  public con(path?: ApiPath): ConApi {
    return this.in(path).asCon();
  }

  public view(): JsonNodeView<N> {
    return this.node.view() as unknown as JsonNodeView<N>;
  }

  public select(path?: ApiPath, leaf?: boolean) {
    try {
      let node = path ? this.find(path) : this.node;
      if (leaf) while (node instanceof ValNode) node = node.child();
      return this.api.wrap(node);
    } catch (e) {
      return;
    }
  }

  public read(path?: ApiPath): unknown {
    const view = this.view();
    if (Array.isArray(path)) return get(view, path);
    if (!path) return view;
    let path2: string = path + '';
    if (path && path2[0] !== '/') path2 = '/' + path2;
    return get(view, toPath(path2));
  }

  public add(path: ApiPath, value: unknown): boolean {
    const [parent, key] = breakPath(path);
    ADD: try {
      const node = this.select(parent, true);
      if (node instanceof ObjApi) {
        node.set({[key]: value});
      } else if (node instanceof ArrApi || node instanceof StrApi || node instanceof BinApi) {
        const length = node.length();
        let index: number = 0;
        if (typeof key === 'number') index = key;
        else if (key === '-') index = length;
        else {
          index = ~~key;
          if (index + '' !== key) break ADD;
        }
        if (index !== index) break ADD;
        if (index < 0) index = 0;
        if (index > length) index = length;
        if (node instanceof ArrApi) {
          node.ins(index, Array.isArray(value) ? value : [value]);
        } else if (node instanceof StrApi) {
          node.ins(index, value + '');
        } else if (node instanceof BinApi) {
          if (!(value instanceof Uint8Array)) break ADD;
          node.ins(index, value);
        }
      } else if (node instanceof VecApi) {
        node.set([[~~key, value]]);
      } else break ADD;
      return true;
    } catch {}
    return false;
  }

  public replace(path: ApiPath, value: unknown): boolean {
    const [parent, key] = breakPath(path);
    REPLACE: try {
      const node = this.select(parent, true);
      if (node instanceof ObjApi) {
        const keyStr = key + '';
        if (!node.has(keyStr)) break REPLACE;
        node.set({[key]: value});
      } else if (node instanceof ArrApi) {
        const length = node.length();
        let index: number = 0;
        if (typeof key === 'number') index = key;
        else {
          index = ~~key;
          if (index + '' !== key) break REPLACE;
        }
        if (index !== index || index < 0 || index > length - 1) break REPLACE;
        const element = node.node.getNode(index);
        if (element instanceof ValNode) {
          this.api.wrap(element).set(value);
        } else {
          node.ins(index, [value]);
          node.del(index + 1, 1);
        }
      } else if (node instanceof VecApi) {
        node.set([[~~key, value]]);
      } else break REPLACE;
      return true;
    } catch {}
    return false;
  }

  public remove(path: ApiPath, length: number = 1): boolean {
    const [parent, key] = breakPath(path);
    REMOVE: try {
      const node = this.select(parent, true);
      if (node instanceof ObjApi) {
        const keyStr = key + '';
        if (!node.has(keyStr)) break REMOVE;
        node.del([keyStr]);
      } else if (node instanceof ArrApi || node instanceof StrApi || node instanceof BinApi) {
        const len = node.length();
        let index: number = 0;
        if (typeof key === 'number') index = key;
        else if (key === '-') index = length;
        else {
          index = ~~key;
          if (index + '' !== key) break REMOVE;
        }
        if (index !== index || index < 0 || index > len) break REMOVE;
        node.del(index, Math.min(length, len - index));
      } else if (node instanceof VecApi) {
        node.set([[~~key, void 0]]);
      } else break REMOVE;
      return true;
    } catch {}
    return false;
  }

  public proxy(): types.ProxyNode<N> {
    return {
      toApi: () => <any>this,
      toView: () => this.node.view() as any,
    };
  }

  public toString(tab: string = ''): string {
    return 'api' + printTree(tab, [(tab) => this.node.toString(tab)]);
  }
}

/**
 * Represents the local changes API for the `con` JSON CRDT node {@link ConNode}.
 *
 * @category Local API
 */
export class ConApi<N extends ConNode<any> = ConNode<any>> extends NodeApi<N> {
  /**
   * Returns a proxy object for this node.
   */
  public proxy(): types.ProxyNodeCon<N> {
    return {
      toApi: () => <any>this,
      toView: () => this.node.view(),
    };
  }
}

/**
 * Local changes API for the `val` JSON CRDT node {@link ValNode}.
 *
 * @category Local API
 */
export class ValApi<
  N extends ValNode<any> = ValNode<any>,
  Extensions extends Extension<number, any, any, any, any>[] = [],
> extends NodeApi<N> {
  /**
   * Get API instance of the inner node.
   * @returns Inner node API.
   */
  public get(): JsonNodeApi<N extends ValNode<infer T> ? T : JsonNode, Extensions> {
    return this.in() as any;
  }

  /**
   * Sets the value of the node.
   *
   * @param json JSON/CBOR value or ID (logical timestamp) of the value to set.
   * @returns Reference to itself.
   */
  public set(json: JsonNodeView<N>): void {
    const {api, node} = this;
    const builder = api.builder;
    const val = builder.constOrJson(json);
    api.builder.setVal(node.id, val);
    api.apply();
  }

  /**
   * Returns a proxy object for this node. Allows to access the value of the
   * node by accessing the `.val` property.
   */
  public proxy(): types.ProxyNodeVal<N> {
    const self = this;
    const proxy = {
      toApi: () => <any>this,
      toView: () => this.node.view(),
      get val() {
        const childNode = self.node.node();
        return (<any>self).api.wrap(childNode).proxy();
      },
    };
    return <any>proxy;
  }
}

type UnVecNode<N> = N extends VecNode<infer T> ? T : never;

/**
 * Local changes API for the `vec` JSON CRDT node {@link VecNode}.
 *
 * @category Local API
 */
export class VecApi<
  N extends VecNode<any> = VecNode<any>,
  Extensions extends Extension<number, any, any, any, any>[] = [],
> extends NodeApi<N> {
  /**
   * Get API instance of a child node.
   *
   * @param key Object key to get.
   * @returns A specified child node API.
   */
  public get<K extends keyof UnVecNode<N>>(key: K): JsonNodeApi<UnVecNode<N>[K], Extensions> {
    return this.in(key as string) as any;
  }

  /**
   * Sets a list of elements to the given values.
   *
   * @param entries List of index-value pairs to set.
   * @returns Reference to itself.
   */
  public set(entries: [index: number, value: unknown][]): void {
    const {api, node} = this;
    const {builder} = api;
    builder.insVec(
      node.id,
      entries.map(([index, json]) => [index, builder.constOrJson(json)]),
    );
    api.apply();
  }

  public push(...values: unknown[]): void {
    const length = this.length();
    this.set(values.map((value, index) => [length + index, value]));
  }

  /**
   * Get the length of the vector without materializing it to a view.
   *
   * @returns Length of the vector.
   */
  public length(): number {
    return this.node.elements.length;
  }

  /**
   * Returns a proxy object for this node. Allows to access vector elements by
   * index.
   */
  public proxy(): types.ProxyNodeVec<N> {
    const proxy = new Proxy(
      {},
      {
        get: (target, prop, receiver) => {
          if (prop === 'toApi') return () => this;
          if (prop === 'toView') return () => this.view();
          if (prop === 'toExt') return () => this.asExt();
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

type UnObjNode<N> = N extends ObjNode<infer T> ? T : never;

/**
 * Local changes API for the `obj` JSON CRDT node {@link ObjNode}.
 *
 * @category Local API
 */
export class ObjApi<
  N extends ObjNode<any> = ObjNode<any>,
  Extensions extends Extension<number, any, any, any, any>[] = [],
> extends NodeApi<N> {
  /**
   * Get API instance of a child node.
   *
   * @param key Object key to get.
   * @returns A specified child node API.
   */
  public get<K extends keyof UnObjNode<N>>(key: K): JsonNodeApi<UnObjNode<N>[K], Extensions> {
    return this.in(key as string) as any;
  }

  /**
   * Sets a list of keys to the given values.
   *
   * @param entries List of key-value pairs to set.
   * @returns Reference to itself.
   */
  public set(entries: Partial<JsonNodeView<N>>): void {
    const {api, node} = this;
    const {builder} = api;
    builder.insObj(
      node.id,
      Object.entries(entries).map(([key, json]) => [key, builder.constOrJson(json)]),
    );
    api.apply();
  }

  /**
   * Deletes a list of keys from the object.
   *
   * @param keys List of keys to delete.
   * @returns Reference to itself.
   */
  public del(keys: string[]): void {
    const {api, node} = this;
    const {builder} = api;
    api.builder.insObj(
      node.id,
      keys.map((key) => [key, builder.const(undefined)]),
    );
    api.apply();
  }

  /**
   * Checks if a key exists in the object.
   *
   * @param key Key to check.
   * @returns True if the key exists, false otherwise.
   */
  public has(key: string): boolean {
    return this.node.keys.has(key);
  }

  /**
   * Returns a proxy object for this node. Allows to access object properties
   * by key.
   */
  public proxy(): types.ProxyNodeObj<N> {
    const proxy = new Proxy(
      {},
      {
        get: (target, prop, receiver) => {
          if (prop === 'toApi') return () => this;
          if (prop === 'toView') return () => this.view();
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
 * Local changes API for the `str` JSON CRDT node {@link StrNode}. This API
 * allows to insert and delete bytes in the UTF-16 string by referencing its
 * local character positions.
 *
 * @category Local API
 */
export class StrApi extends NodeApi<StrNode> {
  /**
   * Inserts text at a given position.
   *
   * @param index Position at which to insert text.
   * @param text Text to insert.
   * @returns Reference to itself.
   */
  public ins(index: number, text: string): void {
    const {api, node} = this;
    api.onBeforeLocalChange.emit(api.next);
    const builder = api.builder;
    builder.pad();
    const nextTime = api.builder.nextTime();
    const id = new Timestamp(builder.clock.sid, nextTime);
    const after = node.insAt(index, id, text);
    if (!after) throw new Error('OUT_OF_BOUNDS');
    builder.insStr(node.id, after, text);
    api.advance();
  }

  /**
   * Deletes a range of text at a given position.
   *
   * @param index Position at which to delete text.
   * @param length Number of UTF-16 code units to delete.
   * @returns Reference to itself.
   */
  public del(index: number, length: number): void {
    const {api, node} = this;
    api.onBeforeLocalChange.emit(api.next);
    const builder = api.builder;
    builder.pad();
    const spans = node.findInterval(index, length);
    if (!spans) throw new Error('OUT_OF_BOUNDS');
    node.delete(spans);
    builder.del(node.id, spans);
    api.advance();
  }

  /**
   * Given a character index in local coordinates, find the ID of the character
   * in the global coordinates.
   *
   * @param index Index of the character or `-1` for before the first character.
   * @returns ID of the character after which the given position is located.
   */
  public findId(index: number | -1): ITimestampStruct {
    const node = this.node;
    const length = node.length();
    const max = length - 1;
    if (index > max) index = max;
    if (index < 0) return node.id;
    const id = node.find(index);
    return id || node.id;
  }

  /**
   * Given a position in global coordinates, find the position in local
   * coordinates.
   *
   * @param id ID of the character.
   * @returns Index of the character in local coordinates. Returns -1 if the
   *          the position refers to the beginning of the string.
   */
  public findPos(id: ITimestampStruct): number | -1 {
    const node = this.node;
    const nodeId = node.id;
    if (nodeId.sid === id.sid && nodeId.time === id.time) return -1;
    const chunk = node.findById(id);
    if (!chunk) return -1;
    const pos = node.pos(chunk);
    return pos + (chunk.del ? 0 : id.time - chunk.id.time);
  }

  /**
   * Get the length of the string without materializing it to a view.
   *
   * @returns Length of the string.
   */
  public length(): number {
    return this.node.length();
  }

  /**
   * Returns a proxy object for this node.
   */
  public proxy(): types.ProxyNodeStr {
    return {
      toApi: () => this,
      toView: () => this.node.view(),
    };
  }
}

/**
 * Local changes API for the `bin` JSON CRDT node {@link BinNode}. This API
 * allows to insert and delete bytes in the binary string by referencing their
 * local index.
 *
 * @category Local API
 */
export class BinApi extends NodeApi<BinNode> {
  /**
   * Inserts octets at a given position.
   *
   * @param index Position at which to insert octets.
   * @param data Octets to insert.
   * @returns Reference to itself.
   */
  public ins(index: number, data: Uint8Array): void {
    const {api, node} = this;
    const after = !index ? node.id : node.find(index - 1);
    if (!after) throw new Error('OUT_OF_BOUNDS');
    api.builder.insBin(node.id, after, data);
    api.apply();
  }

  /**
   * Deletes a range of octets at a given position.
   *
   * @param index Position at which to delete octets.
   * @param length Number of octets to delete.
   * @returns Reference to itself.
   */
  public del(index: number, length: number): void {
    const {api, node} = this;
    const spans = node.findInterval(index, length);
    if (!spans) throw new Error('OUT_OF_BOUNDS');
    api.builder.del(node.id, spans);
    api.apply();
  }

  /**
   * Get the length of the binary blob without materializing it to a view.
   *
   * @returns Length of the binary blob.
   */
  public length(): number {
    return this.node.length();
  }

  /**
   * Returns a proxy object for this node.
   */
  public proxy(): types.ProxyNodeBin {
    return {
      toApi: () => this,
      toView: () => this.node.view(),
    };
  }
}

type UnArrNode<N> = N extends ArrNode<infer T> ? T : never;

/**
 * Local changes API for the `arr` JSON CRDT node {@link ArrNode}. This API
 * allows to insert and delete elements in the array by referencing their local
 * index.
 *
 * @category Local API
 */
export class ArrApi<
  N extends ArrNode<any> = ArrNode<any>,
  Extensions extends Extension<number, any, any, any, any>[] = [],
> extends NodeApi<N> {
  /**
   * Get API instance of a child node.
   *
   * @param index Index of the element to get.
   * @returns Child node API for the element at the given index.
   */
  public get(index: number): JsonNodeApi<UnArrNode<N>, Extensions> {
    return this.in(index) as any;
  }

  /**
   * Inserts elements at a given position.
   *
   * @param index Position at which to insert elements.
   * @param values JSON/CBOR values or IDs of the values to insert.
   * @returns Reference to itself.
   */
  public ins(index: number, values: Array<JsonNodeView<N>[number]>): void {
    const {api, node} = this;
    const {builder} = api;
    const after = !index ? node.id : node.find(index - 1);
    if (!after) throw new Error('OUT_OF_BOUNDS');
    const valueIds: ITimestampStruct[] = [];
    for (let i = 0; i < values.length; i++) valueIds.push(builder.json(values[i]));
    builder.insArr(node.id, after, valueIds);
    api.apply();
  }

  /**
   * Deletes a range of elements at a given position.
   *
   * @param index Position at which to delete elements.
   * @param length Number of elements to delete.
   * @returns Reference to itself.
   */
  public del(index: number, length: number): void {
    const {api, node} = this;
    const spans = node.findInterval(index, length);
    if (!spans) throw new Error('OUT_OF_BOUNDS');
    api.builder.del(node.id, spans);
    api.apply();
  }

  /**
   * Get the length of the array without materializing it to a view.
   *
   * @returns Length of the array.
   */
  public length(): number {
    return this.node.length();
  }

  /**
   * Returns a proxy object that allows to access array elements by index.
   *
   * @returns Proxy object that allows to access array elements by index.
   */
  public proxy(): types.ProxyNodeArr<N> {
    const proxy = new Proxy(
      {},
      {
        get: (target, prop, receiver) => {
          if (prop === 'toApi') return () => this;
          if (prop === 'toView') return () => this.view();
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
