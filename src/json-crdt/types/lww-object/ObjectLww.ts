import {compare, ITimestampStruct, toDisplayString} from '../../../json-crdt-patch/clock';
import {Model} from '../../model';
import {printTree} from '../../../util/print/printTree';
import type {Printable} from '../../../util/print/types';
import type {JsonNode} from '../../types';

export class ObjectLww implements JsonNode, Printable {
  public readonly keys: Map<string, ITimestampStruct> = new Map();

  constructor(protected readonly doc: Model, public readonly id: ITimestampStruct) {}

  public get(key: string): undefined | JsonNode {
    const id = this.keys.get(key);
    if (!id) return undefined;
    return this.doc.index.get(id);
  }

  /**
   * Rewrites object key.
   * @param key Object key to set.
   * @param id ID of the contents of the key.
   * @returns Returns old entry ID, if any.
   */
  public put(key: string, id: ITimestampStruct): undefined | ITimestampStruct {
    const currentId = this.keys.get(key);
    if (currentId && compare(currentId, id) >= 0) return;
    this.keys.set(key, id);
    return currentId;
  }

  public nodes(callback: (node: JsonNode, key: string) => void) {
    const index = this.doc.index;
    this.keys.forEach((id, key) => callback(index.get(id)!, key));
  }

  // ----------------------------------------------------------------- JsonNode

  public children(callback: (node: JsonNode) => void) {
    const index = this.doc.index;
    this.keys.forEach((id, key) => callback(index.get(id)!));
  }

  public child() {
    return undefined;
  }

  public container(): JsonNode | undefined {
    return this;
  }

  private _tick: number = 0;
  private _view: Readonly<Record<string, unknown>> = {};
  public view(): Readonly<Record<string, unknown>> {
    const doc = this.doc;
    const tick = doc.clock.time + doc.tick;
    const _view = this._view;
    if (this._tick === tick) return _view;
    const view: Record<string, unknown> = {};
    const index = doc.index;
    let useCache = true;
    this.keys.forEach((id, key) => {
      const value = index.get(id)!.view();
      if (value !== undefined) {
        if (_view[key] !== value) useCache = false;
        view[key] = value;
      } else if (_view[key] !== undefined) useCache = false;
    });
    return useCache ? _view : ((this._tick = tick), (this._view = view));
  }

  public api: undefined | unknown = undefined;

  // ---------------------------------------------------------------- Printable

  public toString(tab: string = ''): string {
    const header = this.constructor.name + ' ' + toDisplayString(this.id);
    return (
      header +
      printTree(
        tab,
        [...this.keys.entries()].map(
          ([key, id]) =>
            (tab) =>
              JSON.stringify(key) + printTree(tab + ' ', [(tab) => this.doc.index.get(id)!.toString(tab)]),
        ),
      )
    );
  }
}
