import {Log} from '../../json-crdt/log/Log';
import {DomController} from './dom/DomController';
import {ValueSyncStore} from '../../util/events/sync-store';
import type {PeritextPlugin} from './react/types';
import type {Peritext} from '../../json-crdt-extensions/peritext/Peritext';
import type {PeritextEventDefaults} from '../events/defaults/PeritextEventDefaults';
import type {UiLifeCyclesRender} from './types';

export class PeritextSurfaceState implements UiLifeCyclesRender {
  public readonly peritext: Peritext;
  public readonly dom: DomController;
  public readonly log: Log;
  public readonly render = new ValueSyncStore<number>(0);

  public readonly rerender = (): void => {
    const {peritext, render} = this;
    peritext.refresh();
    render.next(render.value + 1);
  };

  constructor(
    public readonly events: PeritextEventDefaults,
    public readonly el: HTMLElement,
    public readonly plugins: PeritextPlugin[],
  ) {
    const peritext = this.peritext = events.txt;
    const log = this.log = Log.from(peritext.model);
    this.dom = new DomController({
      events,
      log,
      source: el,
    });
  }

  public start() {
    const {dom, rerender} = this;
    const et = dom.et;
    dom.start();
    et.addEventListener('change', rerender);
    return () => {
      this.log.destroy();
      dom.stop();
      et.removeEventListener('change', rerender);
    };
  }
}
