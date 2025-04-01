import {Log} from '../../../json-crdt/log/Log';
import type {PeritextPlugin} from './types';
import type {Peritext} from '../../../json-crdt-extensions/peritext/Peritext';
import type {DomController} from '../dom/DomController';
import type {PeritextEventDefaults} from '../../events/defaults/PeritextEventDefaults';
import type {UiLifeCyclesRender} from '../types';

export class PeritextSurfaceState implements UiLifeCyclesRender {
  public dom?: DomController = void 0;
  public log: Log;

  constructor(
    public readonly peritext: Peritext,
    public readonly events: PeritextEventDefaults,
    public readonly rerender: () => void,
    public readonly plugins: PeritextPlugin[],
  ) {
    this.log = Log.from(peritext.model);
  }

  public start() {
    return () => {
      this.log.destroy();
    };
  }
}
