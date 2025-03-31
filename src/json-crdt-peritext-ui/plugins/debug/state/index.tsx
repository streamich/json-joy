import {ValueSyncStore} from '../../../../util/events/sync-store';
import type {UiLifeCyclesRender} from '../../../dom/types';

export class DebugState implements UiLifeCyclesRender {
  public readonly enabled = new ValueSyncStore<boolean>(false);
  public readonly showSliceOutlines = new ValueSyncStore<boolean>(true);

  /** ------------------------------------------- {@link UiLifeCyclesRender} */

  public start() {
    return () => {
      
    };
  }
}
