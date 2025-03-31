import {ValueSyncStore} from '../../../../util/events/sync-store';
import type {UiLifeCyclesRender} from '../../../dom/types';

export class DebugState implements UiLifeCyclesRender {
  public readonly enabled = new ValueSyncStore<boolean>(false);
  public readonly showSliceOutlines = new ValueSyncStore<boolean>(true);
  public readonly showSliceInfo = new ValueSyncStore<boolean>(true);

  public toggleDebugMode(): void {
    const {enabled, showSliceOutlines, showSliceInfo} = this;
    if (!enabled.value) {
      enabled.next(true);
      showSliceOutlines.next(true);
      showSliceInfo.next(true);
    } else {
      if (showSliceOutlines.value) {
        showSliceOutlines.next(false);
      } if (showSliceInfo.value) {
        showSliceInfo.next(false);
      } else {
        enabled.next(false);
        showSliceOutlines.next(true);
        showSliceInfo.next(true);
      }
    }
  }

  /** ------------------------------------------- {@link UiLifeCyclesRender} */

  public start() {
    return () => {
      
    };
  }
}
