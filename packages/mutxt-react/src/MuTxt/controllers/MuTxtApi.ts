import {Editor, Path, Range, Text, Transforms, Element as SlateElement, Location, Span} from 'slate';
import {ReactEditor} from 'slate-react';
import type {MuTxtState} from './MuTxtState';
import type {BaseEditor} from 'slate';
import type {HistoryEditor} from 'slate-history';
import {CustomElement} from '../types';

/** Public API for of the mu-txt editor. */
export class MuTxtApi {
  public readonly editor: BaseEditor & ReactEditor & HistoryEditor;

  constructor(public readonly state: MuTxtState) {
    this.editor = state.editor;
  }

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

  public hasRangeSelection(): boolean {
    const {selection} = this.state.editor;
    return !!selection && !Range.isCollapsed(selection);
  }

  public marks(): Omit<Text, 'text'> | null {
    return Editor.marks(this.editor)
  }

  public getBlock(at?: Location | Span): CustomElement | null {
    const {editor} = this;
    if (!at) {
      const {selection} = editor;
      if (selection) at = Editor.unhangRange(editor, selection);
    }
    if (at) {
      const [match] = Editor.nodes(editor, {at,
        match: (node) => SlateElement.isElement(node) && Editor.isBlock(editor, node),
      });
      if (match) return match[0] as CustomElement;
    }
    const firstChild = editor.children[0];
    return SlateElement.isElement(firstChild) && Editor.isBlock(editor, firstChild) ? (firstChild as CustomElement) : null;
  }
}
