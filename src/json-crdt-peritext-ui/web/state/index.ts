import {BehaviorSubject} from 'rxjs';
import {Log} from '../../../json-crdt/log/Log';
import {DomController} from '../dom/DomController';
import type {PeritextPlugin} from '../react/types';
import type {Peritext} from '../../../json-crdt-extensions/peritext/Peritext';
import type {PeritextEventDefaults} from '../../events/defaults/PeritextEventDefaults';
import type {UiLifeCycles} from '../types';

export class PeritextSurfaceState implements UiLifeCycles {
  public readonly peritext: Peritext;
  public readonly dom: DomController;
  public readonly log: Log;
  public readonly render$ = new BehaviorSubject<number>(0);

  public readonly rerender = (): void => {
    const {peritext, render$} = this;
    peritext.refresh();
    render$.next(render$.getValue() + 1);
  };

  constructor(
    public readonly events: PeritextEventDefaults,
    public readonly plugins: PeritextPlugin[],
  ) {
    const peritext = (this.peritext = events.txt);
    const log = (this.log = Log.from(peritext.model));
    this.dom = new DomController(events, log);
  }

  /** -------------------------------------------------- {@link UiLifeCycles} */

  public el!: HTMLElement;

  public start() {
    const {dom, rerender, el} = this;
    dom.el = el;
    const stopDom = dom.start();
    const et = dom.et;
    et.addEventListener('change', rerender);
    return () => {
      this.log.destroy();
      stopDom();
      et.removeEventListener('change', rerender);
    };
  }
}
