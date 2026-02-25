import {CommonSliceType} from 'json-joy/lib/json-crdt-extensions/peritext';
import type {UiLifeCycles} from '../types';
import type {DomController} from './DomController';

export class RichTextController implements UiLifeCycles {
  public constructor(public readonly dom: DomController) {}

  /** -------------------------------------------------- {@link UiLifeCycles} */

  public start() {
    const dom = this.dom;
    const el = dom.el;
    const onKeyDown = (event: KeyboardEvent): void => {
      const key = event.key;
      if (event.isComposing || key === 'Dead') return;
      const et = dom.et;
      if (event.metaKey || event.ctrlKey) {
        switch (key) {
          case 'b':
            event.preventDefault();
            et.format('tog', CommonSliceType.b);
            return;
          case 'i':
            event.preventDefault();
            et.format('tog', CommonSliceType.i);
            return;
          case 'u':
            event.preventDefault();
            et.format('tog', CommonSliceType.u);
            return;
        }
      }
      if (event.metaKey && event.shiftKey) {
        switch (key) {
          case 'x':
            event.preventDefault();
            et.format('tog', CommonSliceType.s);
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
