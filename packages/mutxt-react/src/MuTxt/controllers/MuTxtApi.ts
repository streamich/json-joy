import type {MuTxtState} from './MuTxtState';

/** Public API for the `mutxt` editor. */
export class MuTxtApi {
  constructor(public readonly state: MuTxtState) {}

  public focus() {
    throw new Error('Not implemented: focus()');
  }

  public blur() {
    throw new Error('Not implemented: blur()');
  }
}
