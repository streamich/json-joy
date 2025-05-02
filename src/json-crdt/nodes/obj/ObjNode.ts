import {printTree} from 'tree-dump/lib/printTree';
import {compare, type ITimestampStruct, printTs} from '../../../json-crdt-patch/clock';
import {ConNode} from '../const/ConNode';
import type {JsonNode, JsonNodeView} from '..';
import type {Model} from '../../model';
import type {Printable} from 'tree-dump/lib/types';

/**
 * Represents a `obj` JSON CRDT node, which is a Last-write-wins (LWW) object.
 * It is a map of string keys to LWW registers. The value of each register is
 * a reference to another JSON CRDT node.
 *
 * @category CRDT Node
 */

export class ObjNode<Value extends Record<string, JsonNode> = Record<string, JsonNode>>
  implements JsonNode<JsonNodeView<Value>>, Printable
{
  /**
   * @ignore
   */
  public readonly keys: Map<string, ITimestampStruct> = new Map();

  constructor(
    /**
     * @ignore
     */
    protected readonly doc: Model<any>,
    public readonly id: ITimestampStruct,
  ) {}

  /**
   * Retrieves a JSON CRDT node at the given key.
   *
   * @param key A key of the object.
   * @returns JSON CRDT node at the given key, if any.
   */
  public get<K extends keyof Value>(key: K): undefined | Value[K] {
    const id = this.keys.get(key as string);
    if (!id) return undefined;
    return this.doc.index.get(id) as Value[K];
  }

  /**
   * Rewrites object key.
   *
   * @param key Object key to set.
   * @param id ID of the contents of the key.
   * @returns Returns old entry ID, if any.
   * @ignore
   */
  public put(key: string, id: ITimestampStruct): undefined | ITimestampStruct {
    const currentId = this.keys.get(key);
    if (currentId && compare(currentId, id) >= 0) return;
    this.keys.set(key, id);
    return currentId;
  }

  /**
   * Iterate over all key-value pairs in the object.
   *
   * @param callback Callback to call for each key-value pair.
   */
  public nodes(callback: (node: JsonNode, key: string) => void) {
    const index = this.doc.index;
    this.keys.forEach((id, key) => callback(index.get(id)!, key));
  }

  public forEach(callback: (key: string, value: JsonNode) => void) {
    const index = this.doc.index;
    this.keys.forEach((id, key) => {
      const value = index.get(id);
      if (!value || (value instanceof ConNode && value.val === void 0)) return;
      callback(key, value);
    });
  }

  // ----------------------------------------------------------------- JsonNode

  /**
   * @ignore
   */
  public children(callback: (node: JsonNode) => void) {
    const index = this.doc.index;
    this.keys.forEach((id, key) => callback(index.get(id)!));
  }

  /**
   * @ignore
   */
  public child() {
    return undefined;
  }

  /**
   * @ignore
   */
  public container(): JsonNode | undefined {
    return this;
  }

  /**
   * @ignore
   */
  private _tick: number = 0;

  /**
   * @ignore
   */
  private _view = {} as JsonNodeView<Value>;

  /**
   * @ignore
   */
  public view(): JsonNodeView<Value> {
    const doc = this.doc;
    const tick = doc.clock.time + doc.tick;
    const _view = this._view;
    if (this._tick === tick) return _view;
    const view = {} as JsonNodeView<Value>;
    const index = doc.index;
    let useCache = true;
    this.keys.forEach((id, key) => {
      const valueNode = index.get(id);
      if (!valueNode) {
        useCache = false;
        return;
      }
      const value = valueNode.view();
      if (value !== undefined) {
        if (_view[key] !== value) useCache = false;
        (<any>view)[key] = value;
      } else if (_view[key] !== undefined) useCache = false;
    });
    return useCache ? _view : ((this._tick = tick), (this._view = view));
  }

  /**
   * @ignore
   */
  public api: undefined | unknown = undefined;

  public name(): string {
    return 'obj';
  }

  // ---------------------------------------------------------------- Printable

  public toString(tab: string = ''): string {
    const header = this.name() + ' ' + printTs(this.id);
    return (
      header +
      printTree(
        tab,
        [...this.keys.entries()]
          .filter(([, id]) => !!this.doc.index.get(id))
          .map(
            ([key, id]) =>
              (tab) =>
                JSON.stringify(key) + printTree(tab + ' ', [(tab) => this.doc.index.get(id)!.toString(tab)]),
          ),
      )
    );
  }
}
