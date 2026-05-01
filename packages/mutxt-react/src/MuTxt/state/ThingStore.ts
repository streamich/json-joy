import {rsync, type UiLifeCycles} from '@jsonjoy.com/ui';
import {s} from 'json-joy/lib/json-crdt';
import type {ObjApi, ObjNode} from 'json-joy/lib/json-crdt';
import type {MuTxtState} from './MuTxtState';
import type {Thing} from '../types';

/**
 * Flat JSON CRDT `obj` map of every thing in the document, keyed by `@id`.
 * Each thing is its own child `obj` node, so per-field updates merge under
 * concurrent edits instead of replacing the whole record.
 */
export class ThingStore implements UiLifeCycles {
  public readonly version = rsync.val(0);

  private _obj?: ObjApi<ObjNode>;
  private unsub?: () => void;
  private idCnt = 0;

  constructor(public readonly mutxt: MuTxtState) {}

  /**
   * Returns the `/things` obj API, creating it on the document if missing.
   * Only call from write paths — touching this on a read-only / pinned model
   * would mutate the model on mount and trigger pin enforcement loops.
   */
  public get obj(): ObjApi<ObjNode> {
    if (this._obj) return this._obj;
    const docObj = this.mutxt.obj;
    if (!docObj.has('things')) docObj.add('/things', s.obj({}));
    this._obj = docObj.obj('/things') as ObjApi<ObjNode>;
    return this._obj;
  }

  /** Returns the obj API only if `/things` already exists; never writes. */
  private read(): ObjApi<ObjNode> | undefined {
    if (this._obj) return this._obj;
    const docObj = this.mutxt.obj;
    if (!docObj.has('things')) return undefined;
    this._obj = docObj.obj('/things') as ObjApi<ObjNode>;
    return this._obj;
  }

  public start(): () => void {
    const subscribe = (target: ObjApi<ObjNode>) => target.onSubtreeChange(() => {
      this.version.next(this.version.value + 1);
    });
    const initial = this.read();
    if (initial) {
      this.unsub = subscribe(initial);
    } else {
      // `/things` doesn't exist yet. Watch the document for when it appears
      // (e.g. when the user pastes an image), then re-subscribe directly.
      const docObj = this.mutxt.obj;
      const docUnsub = docObj.onSubtreeChange(() => {
        const obj = this.read();
        if (!obj) return;
        docUnsub();
        this.unsub = subscribe(obj);
        this.version.next(this.version.value + 1);
      });
      this.unsub = docUnsub;
    }
    return () => {
      this.unsub?.();
      this.unsub = undefined;
    };
  }

  public readonly nextId = (): string => {
    const cnt = this.idCnt++;
    const clock = this.mutxt.obj.api.model.clock;
    return `${clock.sid}-${clock.time}-${cnt}`;
  };

  public has(id: string): boolean {
    return this.read()?.has(id) ?? false;
  }

  public get(id: string): Thing | undefined {
    const obj = this.read();
    if (!obj || !obj.has(id)) return undefined;
    const child = obj.obj(id, true);
    return child ? (child.view() as Thing) : undefined;
  }

  public list(type?: string): Thing[] {
    const obj = this.read();
    if (!obj) return [];
    const view = obj.view() as Record<string, Thing>;
    const result: Thing[] = [];
    for (const id in view) {
      const thing = view[id];
      if (!thing) continue;
      if (type && thing['@type'] !== type) continue;
      result.push(thing);
    }
    return result;
  }

  public add(thing: Omit<Thing, '@id'> & {'@id'?: string}): string {
    const id = thing['@id'] ?? this.nextId();
    this.obj.set({[id]: {...(thing as Thing), '@id': id}});
    return id;
  }

  public update(id: string, partial: Partial<Thing>): boolean {
    const obj = this.read();
    if (!obj || !obj.has(id)) return false;
    const child = obj.obj(id, true);
    if (!child) return false;
    child.mergeKeys(partial);
    return true;
  }

  public remove(id: string): boolean {
    const obj = this.read();
    if (!obj || !obj.has(id)) return false;
    obj.del([id]);
    return true;
  }
}
