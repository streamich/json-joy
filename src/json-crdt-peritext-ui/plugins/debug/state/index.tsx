import {ValueSyncStore} from '../../../../util/events/sync-store';
import type {UiLifeCyclesRender} from '../../../dom/types';

export class DebugState implements UiLifeCyclesRender {
  public readonly enabled = new ValueSyncStore<boolean>(false);
  public readonly showSliceOutlines = new ValueSyncStore<boolean>(true);

  public toggleDebugMode(): void {
    const {enabled, showSliceOutlines} = this;
    if (!enabled.value) {
      enabled.next(true);
      showSliceOutlines.next(true);
    } else {
      if (showSliceOutlines.value) {
        showSliceOutlines.next(false);
      } else {
        enabled.next(false);
        showSliceOutlines.next(true);
      }
    }
  }

  /** ------------------------------------------- {@link UiLifeCyclesRender} */

  public start() {
    return () => {
      
    };
  }
}
