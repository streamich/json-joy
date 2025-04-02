import {Log} from '../../../json-crdt/log/Log';
import {DomController} from '../dom/DomController';
import type {PeritextPlugin} from './types';
import type {Peritext} from '../../../json-crdt-extensions/peritext/Peritext';
import type {PeritextEventDefaults} from '../../events/defaults/PeritextEventDefaults';
import type {UiLifeCyclesRender} from '../types';

export class PeritextSurfaceState implements UiLifeCyclesRender {
  public readonly peritext: Peritext;
  public readonly dom: DomController;
  public readonly log: Log;

  constructor(
    public readonly events: PeritextEventDefaults,
    public readonly el: HTMLElement,
    public readonly rerender: () => void,
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
    this.dom.start();
    return () => {
      this.log.destroy();
      this.dom.stop();
    };
  }
}
