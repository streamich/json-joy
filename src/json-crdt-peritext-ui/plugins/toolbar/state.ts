import type {UiLifeCyclesRender} from '../../dom/types';
import {PeritextEventDetailMap} from '../../events/types';
import type {PeritextSurfaceState} from "../../react";

export class ToolbarState implements UiLifeCyclesRender {
  public lastEvent: PeritextEventDetailMap['change']['ev'] | undefined = void 0;

  constructor (public readonly surface: PeritextSurfaceState) {}

  /** -------------------------------------------------- {@link UiLifeCyclesRender} */

  public start() {
    const et = this.surface.events.et;
    const changeUnsubscribe = et.subscribe('change', (ev) => {
      this.lastEvent = ev.detail.ev;
    });
    return () => {
      changeUnsubscribe();
    };
  }
}
