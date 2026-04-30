import {rsync, type UiLifeCycles} from '@jsonjoy.com/ui';
import {Editor, Node, Element as SlateElement, Path, Transforms} from 'slate';
import {ensureThingsBlock, isThingElement, isThingsContainer} from '../behavior/things';
import type {MuTxtState} from '../state/MuTxtState';
import type {CustomElement, FileElement, Thing, ThingElement, ThingsContainerElement} from '../types';

const REFERENCER_TYPES = new Set<string>(['file']);

const isReferencerElement = (node: unknown): node is FileElement =>
  SlateElement.isElement(node) && REFERENCER_TYPES.has((node as any).type);

const getThingId = (node: unknown): string | null => {
  if (!isReferencerElement(node)) return null;
  const id = (node as any)['@thing'];
  return typeof id === 'string' && id ? id : null;
};

export class ThingsState implements UiLifeCycles {
  /** Bumped on every add/update/remove via the index rebuild. */
  public readonly version = rsync.val(0);

  /** Local index. Rebuilt lazily off `mutxt.contentVersion`. */
  private index: Map<string, {thing: Thing; path: Path}> | null = null;
  private indexedAtContentVersion = -1;

  private contentVersionUnsub?: () => void;

  constructor(public readonly mutxt: MuTxtState) {}

  public start(): () => void {
    this.contentVersionUnsub = this.mutxt.contentVersion.subscribe(() => {
      this.version.next(this.version.value + 1);
    });
    return () => {
      this.contentVersionUnsub?.();
      this.contentVersionUnsub = undefined;
    };
  }

  private idCnt = 0;

  public readonly nextId = (): string => {
    const cnt = this.idCnt++;
    try {
      const peritext = this.mutxt.peritextRef();
      const clock = (peritext as any)?.api?.model?.clock;
      if (clock) return `${clock.sid}-${clock.time}-${cnt}`;
    } catch {}
    return `t-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e9).toString(36)}-${cnt}`;
  };

  private invalidate(): void {
    this.index = null;
    this.indexedAtContentVersion = -1;
    this.version.next(this.version.value + 1);
  }

  // --------------------------------------------------------------------- Read

  private rebuildIndex(): void {
    const map = new Map<string, {thing: Thing; path: Path}>();
    const editor = this.mutxt.editor;
    // Defensive: scan every top-level block for `.things` containers, then
    // every child for `.thing` elements. Handles misplaced or duplicate
    // `.things` blocks (e.g. from a corrupted document or a bad merge) without
    // assuming a single block at index 0.
    for (let blockIdx = 0; blockIdx < editor.children.length; blockIdx++) {
      const block = editor.children[blockIdx];
      if (!isThingsContainer(block)) continue;
      const children = (block as ThingsContainerElement).children;
      for (let childIdx = 0; childIdx < children.length; childIdx++) {
        const child = children[childIdx];
        if (!isThingElement(child)) continue;
        const id = (child as ThingElement).thing?.['@id'];
        if (typeof id === 'string' && id && !map.has(id)) {
          // First occurrence wins on id collision (later blocks/children are
          // ignored — duplicate ids shouldn't happen but defend against it).
          map.set(id, {thing: (child as ThingElement).thing, path: [blockIdx, childIdx]});
        }
      }
    }
    this.index = map;
    this.indexedAtContentVersion = this.mutxt.contentVersion.value;
  }

  private getIndex(): Map<string, {thing: Thing; path: Path}> {
    if (this.index === null || this.indexedAtContentVersion !== this.mutxt.contentVersion.value)
      this.rebuildIndex();
    return this.index!;
  }

  public has(id: string): boolean {
    return this.getIndex().has(id);
  }

  public get(id: string): Thing | undefined {
    return this.getIndex().get(id)?.thing;
  }

  public list(type?: string): Thing[] {
    const result: Thing[] = [];
    for (const {thing} of this.getIndex().values()) {
      if (type && thing['@type'] !== type) continue;
      result.push(thing);
    }
    return result;
  }

  public findPath(id: string): Path | undefined {
    return this.getIndex().get(id)?.path;
  }

  // -------------------------------------------------------------------- Write

  /**
   * Insert a new thing into `.things` and return its id. If `@id` is provided,
   * it is used; otherwise a fresh id is minted via `nextId()`.
   */
  public add(thing: Omit<Thing, '@id'> & {'@id'?: string}): string {
    const id = thing['@id'] ?? this.nextId();
    const next: Thing = {...(thing as Thing), '@id': id};
    const editor = this.mutxt.editor;
    const thingElement = {type: '.thing', thing: next, children: [{text: ''}]} as ThingElement;
    Editor.withoutNormalizing(editor, () => {
      const containerPath = ensureThingsBlock(editor);
      const container = Node.get(editor, containerPath) as ThingsContainerElement;
      const insertAt: Path = [...containerPath, container.children.length];
      Transforms.insertNodes(editor, thingElement as unknown as CustomElement, {
        at: insertAt,
        voids: true,
      });
    });
    this.invalidate();
    return id;
  }

  /**
   * Update one or more fields of a thing in place.
   */
  public update(id: string, partial: Partial<Thing>): boolean {
    const path = this.findPath(id);
    if (!path) return false;
    const editor = this.mutxt.editor;
    const node = Node.get(editor, path);
    if (!isThingElement(node)) return false;
    const next: Thing = {...(node as ThingElement).thing, ...partial, '@id': id};
    Transforms.setNodes(editor, {thing: next} as Partial<ThingElement>, {at: path, voids: true});
    this.invalidate();
    return true;
  }

  /** Remove a thing from `.things`. Does not touch referencing blocks. */
  public remove(id: string): boolean {
    const path = this.findPath(id);
    if (!path) return false;
    Transforms.removeNodes(this.mutxt.editor, {at: path, voids: true});
    this.invalidate();
    return true;
  }

  // --------------------------------------------------------------- References

  /** Paths of every block in user content that references the given thing. */
  public references(id: string): Path[] {
    const out: Path[] = [];
    const editor = this.mutxt.editor;
    for (let i = 0; i < editor.children.length; i++) {
      const node = editor.children[i];
      // Skip `.things` system blocks (their children aren't user content).
      if (isThingsContainer(node)) continue;
      const refId = getThingId(node);
      if (refId === id) out.push([i]);
    }
    return out;
  }

  public referenceCount(id: string): number {
    return this.references(id).length;
  }

  /**
   * Drop things that nothing in user content references. Returns the removed
   * ids. Deferred GC: callers (e.g. a "Compact document" menu item) trigger it
   * explicitly; we never refcount-on-delete.
   */
  public gc(): {removed: string[]} {
    const referenced = new Set<string>();
    const editor = this.mutxt.editor;
    for (let i = 0; i < editor.children.length; i++) {
      const node = editor.children[i];
      if (isThingsContainer(node)) continue;
      const refId = getThingId(node);
      if (refId) referenced.add(refId);
    }
    const removed: string[] = [];
    const allIds = [...this.getIndex().keys()];
    Editor.withoutNormalizing(editor, () => {
      for (const id of allIds) {
        if (referenced.has(id)) continue;
        if (this.remove(id)) removed.push(id);
      }
    });
    return {removed};
  }
}
