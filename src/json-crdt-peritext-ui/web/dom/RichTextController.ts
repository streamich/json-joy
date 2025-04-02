import {CommonSliceType, type Peritext} from '../../../json-crdt-extensions/peritext';
import type {PeritextEventTarget} from '../../events/PeritextEventTarget';
import type {UiLifeCycles} from '../types';

export interface RichTextControllerOpts {
  source: HTMLElement;
  txt: Peritext;
  et: PeritextEventTarget;
}

export class RichTextController implements UiLifeCycles {
  public constructor(public readonly opts: RichTextControllerOpts) {}

  /** -------------------------------------------------- {@link UiLifeCycles} */

  public start() {
    const el = this.opts.source;
    const onKeyDown = (event: KeyboardEvent): void => {
      const key = event.key;
      if (event.isComposing || key === 'Dead') return;
      const et = this.opts.et;
      if (event.metaKey || event.ctrlKey) {
        switch (key) {
          case 'b':
            event.preventDefault();
            et.format(CommonSliceType.b);
            return;
          case 'i':
            event.preventDefault();
            et.format(CommonSliceType.i);
            return;
          case 'u':
            event.preventDefault();
            et.format(CommonSliceType.u);
            return;
        }
      }
      if (event.metaKey && event.shiftKey) {
        switch (key) {
          case 'x':
            event.preventDefault();
            et.format(CommonSliceType.s);
            return;
        }
      }
    };
    el.addEventListener('keydown', onKeyDown);
    return () => {
      el.removeEventListener('keydown', onKeyDown);

    };
  }
}
