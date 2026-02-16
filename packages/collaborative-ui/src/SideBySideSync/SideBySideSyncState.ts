import {Model} from 'json-joy/lib/json-crdt';
import {Log} from 'json-joy/lib/json-crdt/log/Log';
import {PresenceManager} from '@jsonjoy.com/collaborative-presence';
import {JsonCrdtModelState} from '../JsonCrdtModel/JsonCrdtModelState';
import {BehaviorSubject} from 'rxjs';

export class SideBySideSyncState {
  public readonly left: Log;
  public readonly leftState: JsonCrdtModelState;
  public readonly leftPresence: PresenceManager;
  public readonly right: Log;
  public readonly rightState: JsonCrdtModelState;
  public readonly rightPresence: PresenceManager;
  public readonly autoSync$ = new BehaviorSubject<boolean>(false);
  public readonly autoSyncInterval$ = new BehaviorSubject<number>(5000);
  private autoSyncTimer: any = null;

  constructor(model: Model<any>) {
    const leftModel = model.fork();
    const rightModel = model.fork();
    this.left = new Log(() => leftModel.clone());
    this.right = new Log(() => rightModel.clone());
    this.left.end.api.autoFlush();
    this.right.end.api.autoFlush();
    this.leftState = new JsonCrdtModelState();
    this.leftPresence = new PresenceManager();
    this.leftPresence.setUserId('left-user-id');
    this.leftPresence.setMeta({name: 'Left User'});

    this.rightState = new JsonCrdtModelState();
    this.leftState.showModel$.next(false);
    this.leftState.showView$.next(false);
    this.leftState.showDisplay$.next(true);
    this.rightState.showModel$.next(false);
    this.rightState.showView$.next(false);
    this.rightState.showDisplay$.next(true);
    this.rightPresence = new PresenceManager();
    this.rightPresence.setUserId('right-user-id');
    this.rightPresence.setMeta({name: 'Right User'});
  }

  public dispose() {
    clearTimeout(this.autoSyncTimer);
  }

  private loopSync() {
    this.autoSyncTimer = null;
    this.synchronize();
    const interval = this.autoSyncInterval$.getValue();
    this.autoSyncTimer = setTimeout(() => {
      this.loopSync();
    }, interval);
  }

  public readonly toggleAutoSync = () => {
    const autoSync = !this.autoSync$.getValue();
    this.autoSync$.next(autoSync);
    clearTimeout(this.autoSyncTimer);
    this.autoSyncTimer = null;
    if (autoSync) this.loopSync();
  };

  public readonly setAutoSyncInterval = (seconds: number) => {
    const interval = Math.round(seconds * 1000);
    if (interval > 0 && interval < 60000)
      this.autoSyncInterval$.next(interval);
  };

  public readonly syncLeftToRight = () => {
    const patchesLeft = [...this.left.patches.entries()].map(({v}) => v.clone());
    this.right.end.applyBatch(patchesLeft);
  };

  public readonly syncRightToLeft = () => {
    const patchesRight = [...this.right.patches.entries()].map(({v}) => v.clone());
    this.left.end.applyBatch(patchesRight);
  };

  public readonly synchronize = () => {
    this.syncLeftToRight();
    this.syncRightToLeft();
  };
}
