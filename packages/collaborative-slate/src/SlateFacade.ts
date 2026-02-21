import {FromSlate} from './sync/FromSlate';
import {ToSlateNode} from './sync/toSlateNode';
import {applyPatch} from './sync/applyPatch';
import {slatePointToGap, slatePointToPoint, pointToSlatePoint} from './positions';
import type {Fragment} from 'json-joy/lib/json-crdt-extensions/peritext/block/Fragment';
import type {Range} from 'json-joy/lib/json-crdt-extensions/peritext/rga/Range';
import type {Editor, BaseOperation, Point as SlatePoint} from 'slate';
import type {PeritextApi, Peritext} from 'json-joy/lib/json-crdt-extensions';
import type {ViewRange} from 'json-joy/lib/json-crdt-extensions/peritext/editor/types';
import type {
  PeritextRef,
  RichtextEditorFacade,
  PeritextOperation,
  PeritextSelection,
} from '@jsonjoy.com/collaborative-peritext/lib/types';
import type {SlateDocument, SlateEditorOnChange, SlateOperation} from './types';

/**
 * Attempt to extract a single {@link PeritextOperation} from Slate's current
 * operation batch. Returns `undefined` when the batch is too complex (anything
 * other than a single `insert_text` or `remove_text`), in which case the caller
 * should fall back to the full document merge path.
 */
const tryExtractPeritextOperation = (
  operations: BaseOperation[],
  editor: Editor,
  txt: Peritext,
): PeritextOperation | undefined => {
  if (operations.length !== 1) return;
  const op = operations[0];
  if (op.type === 'insert_text') {
    const gap = slatePointToGap(txt, editor, op);
    if (gap < 0) return;
    return [gap, 0, op.text];
  }
  if (op.type === 'remove_text') {
    const text = op.text;
    // For single-character deletes only; multi-char could be a complex block join.
    if (text.length > 1) return;
    const gap = slatePointToGap(txt, editor, op);
    if (gap < 0) return;
    return [gap, text.length, ''];
  }
  return;
};


export interface SlateFacadeOpts {}


/**
 * Slate.js implementation of {@link RichtextEditorFacade}. Connects a Slate.js
 * `Editor` to a json-joy JSON CRDT "peritext" node.
 *
 * Usage:
 *
 * ```ts
 * const editor = withReact(createEditor());
 * const peritextRef = () => model.s.toExt();
 * const facade = new SlateFacade(editor, peritextRef);
 * const unbind = PeritextBinding.bind(peritextRef, facade);
 * ```
 */
export class SlateFacade implements RichtextEditorFacade {
  /** Pending remote operations counter. */
  private _remoteCnt = 0;
  private _disposed = false;

  private _enterRemote(): void {
    this._remoteCnt++;
  }

  private _exitRemote(): void {
    queueMicrotask(() => {
      this._remoteCnt--;
    });
  }

  /** Stateful converter that caches Slate nodes by Peritext `Block.hash`. */
  private readonly _toSlate = new ToSlateNode();

  private readonly _origOnChange: SlateEditorOnChange | undefined;
  private readonly _slateOnChange: SlateEditorOnChange;

  onchange?: (change: PeritextOperation | void) => (PeritextRef | void);
  onselection?: () => void;

  constructor(
    public readonly editor: Editor,
    protected readonly peritext: PeritextRef,
    protected readonly opts: SlateFacadeOpts = {},
  ) {
    // Override editor.onChange to intercept local edits.
    const self = this;
    this._origOnChange = (editor as any).onChange;
    (editor.onChange as SlateEditorOnChange) = this._slateOnChange = (options?: {operation?: SlateOperation}) => {
      self._origOnChange?.call(editor);
      if (self._disposed || !!self._remoteCnt) return;
      const operations = editor.operations;
      const hasDocChange = operations.some((op: BaseOperation) => op.type !== 'set_selection');
      if (hasDocChange) {
        let simpleOperation: PeritextOperation | undefined;
        try {
          const txt = self.peritext().txt;
          simpleOperation = tryExtractPeritextOperation(operations, editor, txt);
        } catch {}
        self.onchange?.(simpleOperation);
      } else {
        self.onselection?.();
      }
    };
  }

  get(): ViewRange {
    if (this._disposed) return ['', 0, []];
    const children = this.editor.children as SlateDocument;
    return FromSlate.convert(children);
  }

  set(fragment: Fragment<string>): void {
    if (this._disposed) return;
    const newChildren = this._toSlate.convert(fragment);
    if (!newChildren.length) return;
    const editor = this.editor;
    this._enterRemote();
    try {
      applyPatch(editor, newChildren);
      editor.onChange();
    } finally {
      this._exitRemote();
    }
  }

  getSelection(): PeritextSelection | undefined {
    if (this._disposed) return;
    const editor = this.editor;
    const selection = editor.selection;
    if (!selection) return;
    const txt = this.peritext().txt;
    const p1 = slatePointToPoint(txt, editor, selection.anchor);
    const p2 = slatePointToPoint(txt, editor, selection.focus);
    const range = txt.rangeFromPoints(p1, p2);
    const startIsAnchor = isBeforeOrEqual(selection.anchor, selection.focus);
    return [range, startIsAnchor];
  }

  setSelection(peritext: PeritextApi, range: Range<string>, startIsAnchor: boolean): void {
    if (this._disposed) return;
    const editor = this.editor;
    const txt = peritext.txt;
    const rootBlock = txt.blocks.root;
    const anchorPoint = startIsAnchor ? range.start : range.end;
    const headPoint = startIsAnchor ? range.end : range.start;
    const anchor = pointToSlatePoint(rootBlock, anchorPoint, editor);
    const focus = pointToSlatePoint(rootBlock, headPoint, editor);
    try {
      if (!validatePoint(editor, anchor) || !validatePoint(editor, focus)) {
        return;
      }
    } catch {
      return;
    }
    this._enterRemote();
    try {
      editor.selection = {anchor, focus};
    } finally {
      this._exitRemote();
    }
  }

  dispose(): void {
    if (this._disposed) return;
    this._disposed = true;
    const e = this.editor as any;
    if (this._origOnChange && (e.onChange === this._slateOnChange)) e.onChange = this._origOnChange;
  }
}

/** Validate that a Slate point references a valid location within the editor
 * tree. Returns `false` if the path is out of bounds or points to a non-text node. */
const validatePoint = (editor: Editor, point: SlatePoint): boolean => {
  const {path, offset} = point;
  let node: any = editor;
  for (const idx of path) {
    const children = node.children;
    if (!children || idx >= children.length) return false;
    node = children[idx];
  }
  if (typeof node.text !== 'string') return false;
  if (offset > node.text.length) return false;
  return true;
};

/** Returns true if point `a` is before or equal to point `b`. */
const isBeforeOrEqual = (a: SlatePoint, b: SlatePoint): boolean => {
  const aPath = a.path;
  const bPath = b.path;
  const len = Math.min(aPath.length, bPath.length);
  for (let i = 0; i < len; i++) {
    if (aPath[i] < bPath[i]) return true;
    if (aPath[i] > bPath[i]) return false;
  }
  if (aPath.length !== bPath.length) return aPath.length < bPath.length;
  return a.offset <= b.offset;
};
