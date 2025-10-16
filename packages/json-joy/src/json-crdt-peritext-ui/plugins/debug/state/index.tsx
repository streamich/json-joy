import {ValueSyncStore} from '../../../../util/events/sync-store';
import type {UiLifeCycles} from '../../../web/types';

export class DebugState implements UiLifeCycles {
  public readonly enabled = new ValueSyncStore<boolean>(false);
  public readonly showSliceOutlines = new ValueSyncStore<boolean>(true);
  public readonly showSliceInfo = new ValueSyncStore<boolean>(true);
  public readonly showCursorInfo = new ValueSyncStore<boolean>(true);

  public toggleDebugMode(): void {
    const {enabled, showSliceOutlines, showSliceInfo, showCursorInfo} = this;
    if (!enabled.value) {
      enabled.next(true);
      showSliceOutlines.next(true);
      showSliceInfo.next(true);
      showCursorInfo.next(true);
    } else {
      if (showSliceOutlines.value) {
        showSliceOutlines.next(false);
      } else if (showSliceInfo.value) {
        showSliceInfo.next(false);
      } else if (showCursorInfo.value) {
        showCursorInfo.next(false);
      } else {
        enabled.next(false);
        showSliceOutlines.next(true);
        showSliceInfo.next(true);
        showCursorInfo.next(true);
      }
    }
  }

  /** ------------------------------------------- {@link UiLifeCycles} */

  public start() {
    return () => {};
  }
}
