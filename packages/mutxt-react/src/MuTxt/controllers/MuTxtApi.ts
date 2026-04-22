import {ReactEditor} from 'slate-react';
import type {MuTxtState} from './MuTxtState';

/** Public API for of the mu-txt editor. */
export class MuTxtApi {
  constructor(public readonly state: MuTxtState) {}

  public focus() {
    ReactEditor.focus(this.state.editor);
  }

  public blur() {
    ReactEditor.blur(this.state.editor);
  }
}
