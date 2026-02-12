import {Plugin, PluginKey, TextSelection} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import {ReplaceStep} from 'prosemirror-transform';
import {FromPm} from './FromPm';
import {Fragment} from 'json-joy/lib/json-crdt-extensions/peritext/block/Fragment';
import {ToPmNode} from './toPmNode';
import {Block, LeafBlock} from 'json-joy/lib/json-crdt-extensions';
import {Range} from 'json-joy/lib/json-crdt-extensions/peritext/rga/Range';
import type {Peritext, PeritextApi} from 'json-joy/lib/json-crdt-extensions';
import type {Point} from 'json-joy/lib/json-crdt-extensions/peritext/rga/Point';
import type {ViewRange} from 'json-joy/lib/json-crdt-extensions/peritext/editor/types';
import type {PeritextRef, RichtextEditorFacade, PeritextOperation} from '../types';
import type {Node as PmNode, ResolvedPos} from 'prosemirror-model';
import {Mark} from 'prosemirror-model';
import type {Transaction} from 'prosemirror-state';

const SYNC_PLUGIN_KEY = new PluginKey<{}>('jsonjoy.com/json-crdt/sync');

const enum TransactionOrigin {
  UNKNOWN,
  LOCAL,
  REMOTE,
}

interface TransactionMeta {
  orig?: TransactionOrigin;
}

/**
 * Convert a flat ProseMirror position to a Peritext gap position (the integer
 * coordinate system used by `Peritext.insAt` / `Peritext.delAt`).
 *
 * Returns `-1` if the position cannot be resolved (e.g. structural mismatch).
 */
const pmPosToGap = (txt: Peritext, doc: PmNode, pmPos: number): number => {
  try {
    const resolved = doc.resolve(pmPos);
    const leafDepth = resolved.depth;
    let block: Block<string> | LeafBlock<string> = txt.blocks.root;
    for (let d = 0; d < leafDepth && block; d++) block = block.children[resolved.index(d)];
    if (!block) return -1;
    const textOffset = resolved.parentOffset;
    const hasMarker = !!(block as LeafBlock<string>).marker;
    return hasMarker ? block.start.viewPos() + 1 + textOffset : textOffset;
  } catch {
    return -1;
  }
};

const pmPosToPoint = (txt: Peritext, resolved: ResolvedPos): Point<string> => {
  const leafDepth = resolved.depth;
  let block: Block<string> | LeafBlock<string> = txt.blocks.root;
  for (let d = 0; d < leafDepth && block; d++) block = block.children[resolved.index(d)];
  if (!block) return txt.pointStart() ?? txt.pointAbsStart();
  const textOffset = resolved.parentOffset;
  const hasMarker = !!(block as LeafBlock<string>).marker;
  const peritextGap = hasMarker ? block.start.viewPos() + 1 + textOffset : textOffset;
  return txt.pointIn(peritextGap);
};

const pointToPmPos = (block: Block<string> | LeafBlock<string>, point: Point<string>, doc: PmNode): number => {
  const viewPos = point.viewPos();
  let pmNode: PmNode = doc;
  let pmPos = 0;
  while (!block.isLeaf()) {
    const children = block.children;
    const len = children.length;
    let found = false;
    for (let i = 0; i < len; i++) {
      const child = children[i];
      const childEndView = child.end.viewPos();
      if (viewPos <= childEndView) {
        for (let j = 0; j < i; j++) pmPos += pmNode.child(j).nodeSize;
        pmPos += 1; // open tag
        block = child;
        pmNode = pmNode.child(i);
        found = true;
        break;
      }
    }
    if (!found) {
      const lastIdx = len - 1;
      for (let j = 0; j < lastIdx; j++) pmPos += pmNode.child(j).nodeSize;
      pmPos += 1; // open tag
      block = children[lastIdx];
      pmNode = pmNode.child(lastIdx);
    }
  }
  const hasMarker = !!(block as LeafBlock<string>).marker;
  const textOffset = hasMarker ? viewPos - (block.start.viewPos() + 1) : viewPos;
  return pmPos + Math.max(0, textOffset);
};

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
  // Bail out when inserting text at an inline-mark boundary. At mark edges
  // ProseMirror decides whether to extend or not extend the mark to the new
  // text, but the fast-path `PeritextOperation` tuple carries no mark info,
  // so fall back to the full document merge to get correct annotations.
  if (insertedText) {
    const $from = doc.resolve(step.from);
    const marksBefore = $from.nodeBefore?.marks ?? Mark.none;
    const marksAfter = $from.nodeAfter?.marks ?? Mark.none;
    if (!Mark.sameSet(marksBefore, marksAfter)) return;
  }
  const gap = pmPosToGap(txt, doc, step.from);
  if (gap < 0) return;
  return [gap, deleteLen, insertedText];
};

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
  ) {
    const self = this;
    const state = view.state;
    const plugin = this._plugin = new Plugin({
      key: SYNC_PLUGIN_KEY,
      state: {
        init() { return {}; },
        apply(transaction, value) {
          const meta = transaction.getMeta(SYNC_PLUGIN_KEY) as TransactionMeta | undefined;
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
                // TODO: PERF: sync up only changed blocks instead of the whole document
                for (let i = 0; i < length; i++)
                  cache.set(peritextChildren[i].hash, pmDoc.child(i));
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
    const updatedPlugins = state.plugins.concat([plugin]);
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
    const { selection, tr } = state;
    const transaction = tr.replaceWith(0, state.doc.content.size, pmNode);
    const newAnchor = transaction.mapping.map(selection.anchor);
    const newHead = transaction.mapping.map(selection.head);
    transaction.setSelection(TextSelection.create(tr.doc, newAnchor, newHead));
    const meta: TransactionMeta = {orig: TransactionOrigin.REMOTE};
    transaction.setMeta(SYNC_PLUGIN_KEY, meta);
    view.dispatch(transaction)
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
    const meta: TransactionMeta = {orig: TransactionOrigin.REMOTE};
    tr.setMeta(SYNC_PLUGIN_KEY, meta);
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
