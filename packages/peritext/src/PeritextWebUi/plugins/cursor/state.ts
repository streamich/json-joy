import {ValueSyncStore} from 'json-joy/lib/util/events/sync-store';
import type {ChangeDetail} from 'json-joy/lib/json-crdt-extensions/peritext/events';
import type {UiLifeCycles} from '../../types';
import type {PeritextSurfaceState} from '../../state';

export class CursorState implements UiLifeCycles {
  /** Current score. */
  public readonly score: ValueSyncStore<number> = new ValueSyncStore(0);

  /** By how much the score changed. */
  public readonly scoreDelta: ValueSyncStore<number> = new ValueSyncStore(0);

  /** The last score that was shown to the user. */
  public readonly lastVisScore: ValueSyncStore<number> = new ValueSyncStore(0);

  constructor(public readonly ctx: PeritextSurfaceState) {}

  /** -------------------------------------------------- {@link UiLifeCycles} */
  public start(): () => void {
    const dom = this.ctx.dom;
    let lastNow: number = 0;

    const onChange = (event: CustomEvent<ChangeDetail>) => {
      const now = Date.now();
      const timeDiff = now - lastNow;
      let delta = 0;
      switch (event.detail.ev?.type) {
        case 'delete':
        case 'insert':
        case 'format':
        case 'marker': {
          delta = timeDiff < 30 ? 10 : timeDiff < 70 ? 5 : timeDiff < 150 ? 2 : timeDiff <= 1000 ? 1 : -1;
          break;
        }
        default: {
          delta = timeDiff <= 1000 ? 0 : -1;
          break;
        }
      }
      if (delta) this.score.next(delta >= 0 ? this.score.value + delta : 0);
      this.scoreDelta.next(delta);
      lastNow = now;
    };

    dom.et.addEventListener('change', onChange);
    return () => {
      dom.et.removeEventListener('change', onChange);
    };
  }
}
