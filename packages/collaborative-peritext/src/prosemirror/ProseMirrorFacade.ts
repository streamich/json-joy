import {Plugin, TextSelection} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import {ReplaceStep} from 'prosemirror-transform';
import {history} from 'prosemirror-history';
import {Mark} from 'prosemirror-model';
import {FromPm} from './sync/FromPm';
import {Fragment} from 'json-joy/lib/json-crdt-extensions/peritext/block/Fragment';
import {ToPmNode} from './sync/toPmNode';
import {applyPatch} from './sync/applyPatch';
import {pmPosToGap, pmPosToPoint, pointToPmPos} from './util';
import {Range} from 'json-joy/lib/json-crdt-extensions/peritext/rga/Range';
import {SYNC_PLUGIN_KEY, TransactionOrigin} from './constants';
import {createPlugin as createPresencePlugin} from './presence/plugin';
import type {Peritext, PeritextApi} from 'json-joy/lib/json-crdt-extensions';
import type {ViewRange} from 'json-joy/lib/json-crdt-extensions/peritext/editor/types';
import type {PeritextRef, RichtextEditorFacade, PeritextOperation} from '../types';
import type {Node as PmNode} from 'prosemirror-model';
import type {Transaction} from 'prosemirror-state';
import type {PresenceManager} from '@jsonjoy.com/collaborative-presence';
import type {PresencePluginOpts} from './presence/plugin';
import type {SyncPluginTransactionMeta} from './sync/types';

/**
 * Attempt to extract a single `PeritextOperation` from a single 1-step
 * ProseMirror transaction. Returns `undefined` when the transaction contains
 * non-trivial steps (anything other than plain-text insert / delete), in which
 * case the caller should fall back to the full document merge path. Also,
 * returns `undefined` if the transaction has more than one step.
 *
 * A step is considered "simple" when it is a `ReplaceStep` whose `slice` is
 * either empty (pure deletion) or contains exactly one flat text node with no
 * open depth (pure text insertion / replacement). This covers:
 *
 *   - Typing a single character
 *   - Backspace / Delete
 *   - Pasting / replacing a selection with plain text
 */
const tryExtractPeritextOperation = (
  tr: Transaction,
  txt: Peritext,
  doc: PmNode,
): PeritextOperation | undefined => {
  const steps = tr.steps;
  if (steps.length !== 1) return;
  const step = steps[0];
  if (!(step instanceof ReplaceStep)) return;
  const slice = step.slice;
  if (!!slice.openStart || !!slice.openEnd) return;
  const content = slice.content;
  let insertedText = '';
  const deleteLen = step.to - step.from;
  if (content.childCount === 0) {
    // Pure deletion — no inserted text. For now, we don't interpret
    // multi-character deletes, as these can result in a complex block join.
    if (deleteLen > 1) return;
  } else if (content.childCount === 1) {
    const child = content.firstChild!;
    if (!child.isText) return;
    insertedText = child.text ?? '';
  } else return;
  if (insertedText) {
    // Bail out when inserting text at an inline-mark boundary. At mark edges
    // ProseMirror decides whether to extend or not extend the mark to the new
    // text (this can be different for different marks and even different for
    // the same mark type, depending on how cursor was positioned), but the
    // fast-path `PeritextOperation` tuple carries no mark info, so fall back
    // to the full document merge to get correct annotations.
    const $from = doc.resolve(step.from);
    const marksBefore = $from.nodeBefore?.marks ?? Mark.none;
    const marksAfter = $from.nodeAfter?.marks ?? Mark.none;
    if (!Mark.sameSet(marksBefore, marksAfter)) return;
  }
  const gap = pmPosToGap(txt, doc, step.from);
  if (gap < 0) return;
  return [gap, deleteLen, insertedText];
};

export interface ProseMirrorFacadeOpts {
  /**
   * Whether to install the `prosemirror-history` undo/redo plugin.
   *
   * - `true` — always install the history plugin (even if one is already
   *   present in the editor state).
   * - `false` — never install the history plugin.
   * - `undefined` (default) — install the history plugin only when the editor
   *   state does not already contain one.
   */
  history?: boolean;

  /**
   * Configuration for the collaborative presence plugin that renders remote
   * cursors and selections. Pass an object with at least a manager field to
   * enable the plugin, or `false` / `undefined` to disable it.
   *
   * When a {@link PresenceManager} instance is passed directly (not wrapped in
   * an options object), it is used with default presence-plugin settings.
   */
  presence?: PresenceManager | PresencePluginOpts | false;
}

export class ProseMirrorFacade implements RichtextEditorFacade {
  _disposed = false;
  _plugin: Plugin;
  toPm: ToPmNode;
  txOrig: TransactionOrigin = TransactionOrigin.UNKNOWN;

  /**
   * The single pending doc-changing transaction from plugin `apply()`, consumed
   * in `update()`.
   */
  _pendingTr:
    /** Attempt to process as a single `PeritextOperation` transaction. */
    | Transaction
    /** Multiple transactions in the same batch, give up on the fast path. */
    | null
    /** No pending transaction. */
    | undefined = undefined;

  onchange?: (change: PeritextOperation | void) => (PeritextRef | void);
  onselection?: () => void;

  constructor(
    protected readonly view: EditorView,
    protected readonly peritext: PeritextRef,
    protected readonly opts: ProseMirrorFacadeOpts = {},
  ) {
    const self = this;
    const state = view.state;
    const plugin = this._plugin = new Plugin({
      key: SYNC_PLUGIN_KEY,
      state: {
        init() { return {}; },
        apply(transaction, value) {
          const meta = transaction.getMeta(SYNC_PLUGIN_KEY) as SyncPluginTransactionMeta | undefined;
          self.txOrig = meta?.orig || TransactionOrigin.UNKNOWN;
          if (transaction.docChanged) {
            // If this is the first doc-changing transaction, stash it.
            // If a second arrives in the same batch, give up on the fast path.
            self._pendingTr = self._pendingTr === undefined ? transaction : null;
          }
          return value;
        },
      },
      view() {
        return {
          update(view, prevState) {
            if (self._disposed) return;
            const origin = self.txOrig;
            self.txOrig = TransactionOrigin.UNKNOWN;
            if (origin === TransactionOrigin.REMOTE) {
              self._pendingTr = undefined;
              return;
            }
            const docChanged = !prevState.doc.eq(view.state.doc);
            if (docChanged) {
              let simpleOperation: PeritextOperation | undefined;
              SIMPLE_OPERATION: {
                const pendingTransaction = self._pendingTr;
                self._pendingTr = undefined;
                if (!pendingTransaction) break SIMPLE_OPERATION
                const txt = self.peritext().txt;
                simpleOperation = tryExtractPeritextOperation(pendingTransaction, txt, prevState.doc);
              }
              const ref = self.onchange?.(simpleOperation);
              KEEP_CACHE_WARM: {
                const peritext = ref?.();
                if (!peritext) break KEEP_CACHE_WARM;
                const txt = peritext.txt;
                const peritextChildren = txt.blocks.root.children;
                const length = peritextChildren.length;
                const pmDoc = view.state.doc;
                if (pmDoc.childCount !== length) break KEEP_CACHE_WARM;
                const cache = self.toPm.cache;
                for (let i = 0; i < length; i++) cache.set(peritextChildren[i].hash, pmDoc.child(i));
                cache.gc();
              }
            } else {
              const selectionChanged = !prevState.selection.eq(view.state.selection)
              if (selectionChanged) self.onselection?.();
            }
          },
          destroy() {
            self._disposed = true;
          }
        };
      },
    });
    this.toPm = new ToPmNode(state.schema);
    const {presence: presenceOpt, history: historyOpt} = this.opts;
    let presencePlugin: Plugin | undefined;
    if (presenceOpt) {
      const presencePluginOpts: PresencePluginOpts =
        typeof (presenceOpt as PresencePluginOpts).manager === 'object'
          ? {...(presenceOpt as PresencePluginOpts), peritext}
          : {manager: presenceOpt as PresenceManager, peritext};
      presencePlugin = createPresencePlugin(presencePluginOpts);
    }
    const hasHistory = state.plugins.some(p => (p as any).key === 'history$');
    const installHistory =
      historyOpt === true ? true : historyOpt === false ? false : !hasHistory;
    const plugins: Plugin[] = installHistory ? [plugin, history()] : [plugin];
    if (presencePlugin) plugins.push(presencePlugin);
    const updatedPlugins = state.plugins.concat(plugins);
    const newState = state.reconfigure({ plugins: updatedPlugins });
    view.updateState(newState);
  }

  get(): ViewRange {
    if (this._disposed) return ['', 0, []]
    const doc = this.view.state.doc;
    return FromPm.convert(doc);
  }

  set(fragment: Fragment<string>): void {
    if (this._disposed) return;
    const pmNode = this.toPm.convert(fragment);
    const view = this.view;
    const state = view.state;
    const {selection, tr} = state;
    applyPatch(tr, state.doc, pmNode);
    if (!tr.docChanged) return;
    const newAnchor = tr.mapping.map(selection.anchor);
    const newHead = tr.mapping.map(selection.head);
    tr.setSelection(TextSelection.create(tr.doc, newAnchor, newHead));
    const meta: SyncPluginTransactionMeta = {orig: TransactionOrigin.REMOTE};
    tr.setMeta(SYNC_PLUGIN_KEY, meta);
    tr.setMeta('addToHistory', false);
    view.dispatch(tr);
  }

  /** Convert current ProseMirror selection to Peritext selection in CRDT-space. */
  getSelection(peritext: PeritextApi): [range: Range<string>, startIsAnchor: boolean] | undefined {
    if (this._disposed) return;
    const view = this.view;
    const selection = view.state.selection;
    if (!selection) return;
    const txt = peritext.txt;
    const p1 = pmPosToPoint(txt, selection.$anchor);
    const p2 = pmPosToPoint(txt, selection.$head);
    const range = txt.rangeFromPoints(p1, p2);
    const startIsAnchor = selection.anchor <= selection.head;
    return [range, startIsAnchor];
  }

  /** Set ProseMirror selection from Peritext CRDT-space selection. */
  setSelection(peritext: PeritextApi, range: Range<string>, startIsAnchor: boolean): void {
    if (this._disposed) return;
    const view = this.view;
    const state = view.state;
    const doc = state.doc;
    const txt = peritext.txt;
    const rootBlock = txt.blocks.root;
    const anchorPoint = startIsAnchor ? range.start : range.end;
    const headPoint = startIsAnchor ? range.end : range.start;
    const anchor = pointToPmPos(rootBlock, anchorPoint, doc);
    const head = pointToPmPos(rootBlock, headPoint, doc);
    const newSelection = TextSelection.create(doc, anchor, head);
    const tr = state.tr.setSelection(newSelection);
    const meta: SyncPluginTransactionMeta = {orig: TransactionOrigin.REMOTE};
    tr.setMeta(SYNC_PLUGIN_KEY, meta);
    tr.setMeta('addToHistory', false);
    view.dispatch(tr);
  }

  dispose(): void {
    if (this._disposed) return;
    this._disposed = true;
    const state = this.view.state;
    const plugins = state.plugins.filter(p => p !== this._plugin);
    const newState = state.reconfigure({ plugins });
    this.view.updateState(newState);
  }
}
