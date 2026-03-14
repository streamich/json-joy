import {Log} from 'json-joy/lib/json-crdt/log/Log';
import {DomController} from '../dom/DomController';
import {BehaviorSubject} from 'rxjs';
import {WebFacade} from '../dom/facade/WebFacade';
import type {PeritextHeadless} from 'json-joy/src/json-crdt-extensions/peritext';
import type {PeritextPlugin} from '../react/types';
import type {Peritext} from 'json-joy/lib/json-crdt-extensions/peritext/Peritext';
import type {PeritextEventDefaults} from 'json-joy/lib/json-crdt-extensions/peritext/events/defaults/PeritextEventDefaults';
import type {UiLifeCycles} from '../types';

export class PeritextSurfaceState implements UiLifeCycles {
  public readonly peritext: Peritext;
  public readonly dom: DomController;
  public readonly log: Log;
  public readonly render$ = new BehaviorSubject<number>(0);
  public readonly events: PeritextEventDefaults;

  /** Overlay portal container element. */
  public portalEl: HTMLDivElement | undefined = void 0;

  public readonly rerender = (): void => {
    const {peritext, render$} = this;
    peritext.refresh();
    render$.next(render$.getValue() + 1);
  };

  constructor(
    public readonly headless: PeritextHeadless,
    public readonly plugins: PeritextPlugin[],
  ) {
    this.events = headless.defaults;
    this.peritext = headless.txt;
    this.log = headless.log;
    this.dom = new DomController(headless);
  }

  /** -------------------------------------------------- {@link UiLifeCycles} */

  public el!: HTMLElement;

  public start() {
    const {dom, rerender, el} = this;
    dom.facade = new WebFacade(el);
    const stopDom = dom.start();
    const et = dom.et;
    et.addEventListener('change', rerender);

    const style = el.style;
    for (const plugin of this.plugins) {
      if (plugin.vars) {
        for (const [key, value] of Object.entries(plugin.vars)) {
          const varName = '--' + key;
          if (style.getPropertyValue(varName) === '') style.setProperty(varName, value);
        }
      }
    }

    return () => {
      this.log.destroy();
      stopDom();
      et.removeEventListener('change', rerender);
    };
  }
}
