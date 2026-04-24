import {Editor, Path, Range, Text, Transforms, Element as SlateElement, Location, Span} from 'slate';
import {ReactEditor} from 'slate-react';
import {CustomElement} from '../types';
import {typeToLabel} from '../util/typeToLabel';
import type {MuTxtState} from './MuTxtState';
import type {BaseEditor} from 'slate';
import type {HistoryEditor} from 'slate-history';

/** Public API for of the mu-txt editor. */
export class MuTxtApi {
  constructor(public readonly state: MuTxtState) {}

  public get editor(): BaseEditor & ReactEditor & HistoryEditor {
    return this.state.editor;
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

  public hasSelection(): boolean {
    const {selection} = this.state.editor;
    return !!selection && !Range.isCollapsed(selection);
  }

  public marks(): Omit<Text, 'text'> | null {
    return Editor.marks(this.editor)
  }

  public block(at?: Location | Span): CustomElement | null {
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

  public blockLabel(at?: Location | Span): string {
    const element = this.block(at);
    if (!element) return 'Paragraph';
    return typeToLabel(element.type) || 'Paragraph';
  }
}
