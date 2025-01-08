import type {UiLifeCyclesRender} from '../../dom/types';
import type {PeritextSurfaceState} from "../../react";

export class ToolbarState implements UiLifeCyclesRender {
  constructor (public readonly surface: PeritextSurfaceState) {}

  /** -------------------------------------------------- {@link UiLifeCyclesRender} */

  public start() {
    const surface = this.surface;
    const cursorUnsubscribe = surface.events.et.subscribe('cursor', (ev) => {
      console.log(ev.detail);
    });
    return () => {
      cursorUnsubscribe();
    };
  }
}
