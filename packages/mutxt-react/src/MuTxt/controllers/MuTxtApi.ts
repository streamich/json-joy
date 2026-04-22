import {ReactEditor} from 'slate-react';
import type {MuTxtState} from './MuTxtState';

/** Public API for of the mu-txt editor. */
export class MuTxtApi {
  constructor(public readonly state: MuTxtState) {}

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
}
