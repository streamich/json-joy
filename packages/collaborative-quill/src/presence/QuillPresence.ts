import {NodeType, str as strPresence} from '@jsonjoy.com/collaborative-presence';
import type {PresenceManager, PresenceEvent} from '@jsonjoy.com/collaborative-presence/lib/PresenceManager';
import type {RgaSelection} from '@jsonjoy.com/collaborative-presence/lib/types';
import type {StrSelectionStrict} from '@jsonjoy.com/collaborative-presence/lib/str';
import type {QuillDeltaApi} from 'json-joy/lib/json-crdt-extensions/quill-delta';
import type {Model} from 'json-joy/lib/json-crdt';
import type Quill from 'quill';
import type {Range} from 'quill';
import type QuillCursorsModule from 'quill-cursors';

/** Accessor for the Quill Delta API. Return `null` / `undefined` when the
 * node is not yet available. */
export type QuillDeltaRef = () => QuillDeltaApi | null | undefined;

export interface PresenceUser {
  name?: string;
  color?: string;
}

export interface QuillPresenceOpts<Meta extends object = object> {
  /** The Quill editor instance. Must have been created with `modules: { cursors: true }`. */
  quill: Quill;
  /** The shared presence store. */
  manager: PresenceManager<Meta>;
  /** Accessor for the QuillDelta CRDT extension API. */
  api: QuillDeltaRef;
  /** Extracts a {@link PresenceUser} (name, color) from the `meta` payload of a
   * `UserPresence` tuple. */
  userFromMeta?: (meta: Meta) => PresenceUser | undefined;
  /** Milliseconds of inactivity after which the cursor is hidden (default 60000). */
  hideAfterMs?: number;
  /** Interval in milliseconds for running {@link PresenceManager.removeOutdated}.
   * Pass `0` to disable internal GC. Default: 5000. */
  gcIntervalMs?: number;
  /** Document ID used to scope presence resolution. Selections in the peer's
   * presence whose `documentId` does not match are ignored. */
  documentId?: string;
}

/**
 * Connects a Quill editor's cursor/selection rendering to a
 * {@link PresenceManager} using the `quill-cursors` module.
 *
 * Remote peers' cursors and selections are rendered via the `quill-cursors`
 * overlay. The local user's selection is broadcast to the presence manager
 * whenever it changes.
 *
 * @example
 * ```ts
 * import Quill from 'quill';
 * import QuillCursors from 'quill-cursors';
 *
 * Quill.register('modules/cursors', QuillCursors);
 *
 * const quill = new Quill(container, { modules: { cursors: true } });
 * const presence = new QuillPresence({ quill, manager, api: () => model.s.toExt() });
 * // ...
 * presence.destroy();
 * ```
 */
export class QuillPresence<Meta extends object = object> {
  private readonly unsub: () => void;
  private readonly gcTimer: ReturnType<typeof setInterval> | undefined;
  private readonly cursorsModule: QuillCursorsModule;
  private readonly opts: QuillPresenceOpts<Meta>;
  private destroyed = false;
  private modelUnsub: (() => void) | null = null;

  constructor(opts: QuillPresenceOpts<Meta>) {
    this.opts = opts;
    const {quill, manager, gcIntervalMs = 5_000} = opts;

    // Retrieve the quill-cursors module instance from the editor.
    this.cursorsModule = quill.getModule('cursors') as QuillCursorsModule;
    if (!this.cursorsModule) {
      throw new Error(
        'QuillPresence: quill-cursors module not found. ' +
          'Register it with `Quill.register("modules/cursors", QuillCursors)` ' +
          'and pass `modules: { cursors: true }` to the Quill options.',
      );
    }

    // Subscribe to remote presence changes.
    this.unsub = manager.onChange.listen((_evt: PresenceEvent) => {
      if (!this.destroyed) this.updateRemoteCursors();
    });

    // Subscribe to local selection changes to broadcast presence.
    quill.on('selection-change', this.onSelectionChange);

    // Periodically GC outdated peers.
    if (gcIntervalMs > 0) this.gcTimer = setInterval(() => manager.removeOutdated(opts.hideAfterMs), gcIntervalMs);

    // Initial render of any already-present remote cursors.
    this.updateRemoteCursors();
  }

  private ensureModelSubscription(api: QuillDeltaApi): void {
    if (this.modelUnsub) return;
    this.modelUnsub = api.api.onChange.listen(() => {
      if (!this.destroyed) this.updateRemoteCursors();
    });
  }

  /** Broadcast the local selection to the presence manager. */
  private readonly onSelectionChange = (range: Range | null) => {
    if (this.destroyed) return;
    const {manager, api: apiRef} = this.opts;
    if (!range) return; // Editor blurred
    const ext = apiRef();
    if (!ext) return;
    const strApi = ext.text();
    const anchor = range.index;
    const focus = range.index + range.length;
    const dto = strPresence.toDto(strApi, [[anchor, focus]]);
    manager.setSelections([dto]);
  };

  /** Generate a color for a peer from their process id. */
  private peerColor(processId: string, user: PresenceUser | undefined): string {
    if (user?.color) return user.color;
    // Simple deterministic hash → HSL colour.
    let hash = 0;
    for (let i = 0; i < processId.length; i++) {
      hash = processId.charCodeAt(i) + ((hash << 5) - hash);
      hash |= 0;
    }
    const hue = ((hash % 360) + 360) % 360;
    return `hsl(${hue}, 70%, 50%)`;
  }

  /** Render / update / remove remote peer cursors and selections. */
  private updateRemoteCursors(): void {
    const {manager, api: apiRef, userFromMeta, hideAfterMs = 60_000, documentId = ''} = this.opts;
    const ext = apiRef();
    if (!ext) return;
    this.ensureModelSubscription(ext);
    const strApi = ext.text();
    const model = strApi.api.model as Model<any>;
    const docLength = strApi.length();
    const now = Date.now();
    const cursorsModule = this.cursorsModule;
    const activePeerIds = new Set<string>();
    const resolved = manager.resolve(documentId, model);
    for (const [processId, slots] of resolved) {
      const entry = manager.peers[processId];
      if (!entry) continue;
      const receivedAt = entry[1];
      if (now - receivedAt >= hideAfterMs) {
        cursorsModule.removeCursor(processId);
        continue;
      }
      const user: PresenceUser | undefined = userFromMeta ? userFromMeta(entry[0][5] as Meta) : undefined;
      for (const rs of slots) {
        const displayed = rs.displayed;
        if (!displayed) continue;
        if (!isRgaSelection(displayed)) continue;
        let strSelections: StrSelectionStrict[];
        try {
          strSelections = strPresence.fromDto(model, displayed);
        } catch {
          continue;
        }
        if (!strSelections.length) continue;
        const [anchor, focus = anchor] = strSelections[0];
        const clampedAnchor = clamp(anchor, 0, docLength);
        const clampedFocus = clamp(focus, 0, docLength);
        const name = user?.name ?? processId.slice(0, 6);
        const color = this.peerColor(processId, user);
        const from = Math.min(clampedAnchor, clampedFocus);
        const to = Math.max(clampedAnchor, clampedFocus);
        activePeerIds.add(processId);
        cursorsModule.createCursor(processId, name, color);
        cursorsModule.moveCursor(processId, {index: from, length: to - from});
      }
    }

    // Remove cursors for peers that are no longer active.
    const localProcessId = manager.getProcessId();
    for (const cursor of cursorsModule.cursors()) {
      if (!activePeerIds.has(cursor.id) && cursor.id !== localProcessId) {
        cursorsModule.removeCursor(cursor.id);
      }
    }
  }

  public destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.unsub();
    this.modelUnsub?.();
    this.modelUnsub = null;
    const {quill} = this.opts;
    quill.off('selection-change', this.onSelectionChange);
    clearInterval(this.gcTimer);
    this.cursorsModule.clearCursors();
  }
}

const clamp = (v: number, min: number, max: number): number => (v < min ? min : v > max ? max : v);

const isRgaSelection = (sel: unknown): sel is RgaSelection => {
  if (!Array.isArray(sel) || sel.length < 8) return false;
  const type = sel[5];
  return type === NodeType.str || type === NodeType.bin || type === NodeType.arr;
};
