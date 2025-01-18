import {ValueSyncStore} from '../../../util/events/sync-store';
import type {UiLifeCyclesRender} from '../../dom/types';
import type {PeritextEventDetailMap} from '../../events/types';
import type {PeritextSurfaceState} from '../../react';

export class ToolbarState implements UiLifeCyclesRender {
  public lastEvent: PeritextEventDetailMap['change']['ev'] | undefined = void 0;
  public readonly showCaretToolbar = new ValueSyncStore<boolean>(false);

  constructor(public readonly surface: PeritextSurfaceState) {}

  /** -------------------------------------------------- {@link UiLifeCyclesRender} */

  public start() {
    const et = this.surface.events.et;
    const changeUnsubscribe = et.subscribe('change', (ev) => {
      const lastEvent = ev.detail.ev;
      this.lastEvent = lastEvent;
      const lastEventIsCaretPositionChange =
        lastEvent?.type === 'cursor' &&
        typeof (lastEvent?.detail as PeritextEventDetailMap['cursor']).at === 'number';
      if (lastEventIsCaretPositionChange)
        this.showCaretToolbar.next(true);
    });
    return () => {
      changeUnsubscribe();
    };
  }
}
