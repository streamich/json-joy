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
  public readonly obj: ObjApi<ObjNode>;

  private unsub?: () => void;
  private idCnt = 0;

  constructor(public readonly mutxt: MuTxtState) {
    const docObj = mutxt.obj;
    if (!docObj.has('things')) docObj.add('/things', s.obj({}));
    this.obj = docObj.obj('/things') as ObjApi<ObjNode>;
  }

  public start(): () => void {
    this.unsub = this.obj.onSubtreeChange(() => {
      this.version.next(this.version.value + 1);
    });
    return () => {
      this.unsub?.();
      this.unsub = undefined;
    };
  }

  public readonly nextId = (): string => {
    const cnt = this.idCnt++;
    const clock = this.obj.api.model.clock;
    return `${clock.sid}-${clock.time}-${cnt}`;
  };

  public has(id: string): boolean {
    return this.obj.has(id);
  }

  public get(id: string): Thing | undefined {
    if (!this.obj.has(id)) return undefined;
    const child = this.obj.obj(id, true);
    return child ? (child.view() as Thing) : undefined;
  }

  public list(type?: string): Thing[] {
    const view = this.obj.view() as Record<string, Thing>;
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
    if (!this.obj.has(id)) return false;
    const child = this.obj.obj(id, true);
    if (!child) return false;
    child.mergeKeys(partial);
    return true;
  }

  public remove(id: string): boolean {
    if (!this.obj.has(id)) return false;
    this.obj.del([id]);
    return true;
  }
}
