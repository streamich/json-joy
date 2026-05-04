import {
  Editor,
  Node as SlateNode,
  type Path,
  Range,
  type Text,
  Element as SlateElement,
  type Location,
  type Span,
  Transforms,
} from 'slate';
import {ReactEditor} from 'slate-react';
import type {CustomElement, MarkFormat} from '../types';
import {eraseMarks, isListType} from '../behavior';
import {typeToLabel} from '../util/typeToLabel';
import {isEmptyDoc} from '../util';
import type {AnchorPoint} from '@jsonjoy.com/ui/lib/utils/popup';
import type {MuTxtState} from './MuTxtState';
import type {BaseEditor} from 'slate';
import type {HistoryEditor} from 'slate-history';

/** Public API for of the mu-txt editor. */
export class MuTxtApi {
  constructor(public readonly state: MuTxtState) {}

  public get editor(): BaseEditor & ReactEditor & HistoryEditor {
    return this.state.editor;
  }

  // ------------------------------------------------------------------- Cursor

  public focused(): boolean {
    const editor = this.state.editor;
    return ReactEditor.isFocused(editor);
  }

  public focus(): void {
    if (!this.focused()) ReactEditor.focus(this.state.editor);
  }

  public blur(): void {
    if (this.focused()) ReactEditor.blur(this.state.editor);
  }

  public deselect(): void {
    try {
      ReactEditor.deselect(this.editor as ReactEditor);
    } catch {}
    try {
      window.getSelection?.()?.removeAllRanges();
    } catch {}
  }

  public hasSelection(): boolean {
    const {selection} = this.state.editor;
    return !!selection && !Range.isCollapsed(selection);
  }

  public focusRect(): DOMRect | undefined {
    if (!this.state.cursor.value) return;
    const selection = window.getSelection();
    if (!selection?.focusNode) return;
    try {
      const focusRange = document.createRange();
      focusRange.setStart(selection.focusNode, selection.focusOffset);
      focusRange.collapse(true);
      const rect = focusRange.getClientRects()[0] ?? focusRange.getBoundingClientRect();
      if (rect.width > 0 || rect.height > 0) return rect;
    } catch {}
    return;
  }

  public focusPoint(): AnchorPoint | undefined {
    try {
      const rect = this.focusRect();
      if (!rect) return;
      const x = rect.left + rect.width / 2;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const GAP = 8;
      if (spaceBelow >= spaceAbove) {
        return {x, y: rect.bottom + GAP, dx: 0, dy: 1};
      }
      return {x, y: rect.top - GAP, dx: 0, dy: -1};
    } catch {
      return;
    }
  }

  /**
   * Move the user's attention to a specific block. Smooth-scrolls the block
   * into view, then places the caret at its start and refocuses the editor.
   */
  public navigateTo(path: Path): boolean {
    const editor = this.editor;
    let node: unknown;
    try {
      node = SlateNode.get(editor, path);
    } catch {
      return false;
    }
    if (!SlateElement.isElement(node)) return false;
    this.deselect();
    this.blur();
    try {
      const domNode = ReactEditor.toDOMNode(editor as ReactEditor, node as SlateElement) as HTMLElement;
      domNode.scrollIntoView({behavior: 'smooth', block: 'start'});
      setTimeout(() => {
        this.deselect();
        this.blur();
        domNode.scrollIntoView({behavior: 'smooth', block: 'start'});
      }, 36);
    } catch {}
    return true;
  }

  // ------------------------------------------------------------------- Inline

  public marks(): Omit<Text, 'text'> | null {
    return Editor.marks(this.editor);
  }

  public isMarkActive(format: MarkFormat): boolean {
    const marks = Editor.marks(this.editor);
    return marks ? marks[format] === true : false;
  }

  public toggleMark(format: MarkFormat): void {
    const editor = this.editor;
    if (this.isMarkActive(format)) Editor.removeMark(editor, format);
    else Editor.addMark(editor, format, true);
  }

  public eraseMarks(): void {
    eraseMarks(this.editor);
  }

  // -------------------------------------------------------------------- Block

  public block(at?: Location | Span): CustomElement | null {
    const {editor} = this;
    if (!at) {
      const {selection} = editor;
      if (selection) at = Editor.unhangRange(editor, selection);
    }
    if (at) {
      const [match] = Editor.nodes(editor, {
        at,
        match: (node) => SlateElement.isElement(node) && Editor.isBlock(editor, node),
      });
      if (match) return match[0] as CustomElement;
    }
    const firstChild = editor.children[0];
    return SlateElement.isElement(firstChild) && Editor.isBlock(editor, firstChild)
      ? (firstChild as CustomElement)
      : null;
  }

  public blockAbove(
    predicate?: (element: CustomElement) => boolean,
    at?: Location,
    mode: 'highest' | 'lowest' = 'lowest',
  ): [CustomElement, Path] | undefined {
    const {editor} = this;
    if (!at) {
      const {selection} = editor;
      if (selection) at = Editor.unhangRange(editor, selection);
    }
    if (!at) return;
    return Editor.above(this.editor, {
      at,
      match: (node) =>
        SlateElement.isElement(node) &&
        Editor.isBlock(this.editor, node) &&
        (predicate?.(node as CustomElement) ?? true),
      mode,
    });
  }

  public listAbove(
    predicate?: (element: CustomElement) => boolean,
    at?: Location,
    mode: 'highest' | 'lowest' = 'lowest',
  ): [CustomElement, Path] | undefined {
    return this.blockAbove((n) => isListType(n.type) && (predicate?.(n as CustomElement) ?? true), at, mode);
  }

  public blockLabel(at?: Location | Span): string {
    const element = this.block(at);
    if (!element) return 'Paragraph';
    return typeToLabel(element.type) || 'Paragraph';
  }

  // ----------------------------------------------------------------- Document

  public isEmpty(): boolean {
    return isEmptyDoc(this.editor);
  }
}
