import {Editor, Path, Range, Text, Transforms} from 'slate';
import {ReactEditor} from 'slate-react';
import type {MuTxtState} from './MuTxtState';
import type {BaseEditor} from 'slate';
import type {HistoryEditor} from 'slate-history';

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
}
