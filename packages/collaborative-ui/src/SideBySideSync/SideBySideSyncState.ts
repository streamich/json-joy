import {Model} from 'json-joy/lib/json-crdt';
import {Log} from 'json-joy/lib/json-crdt/log/Log';
import {JsonCrdtModelState} from '../JsonCrdtModel/JsonCrdtModelState';

export class SideBySideSyncState {
  public readonly left: Log;
  public readonly leftState: JsonCrdtModelState;
  public readonly right: Log;
  public readonly rightState: JsonCrdtModelState;

  constructor(model: Model<any>) {
    const leftModel = model.fork();
    const rightModel = model.fork();
    this.left = new Log(() => leftModel.clone());
    this.right = new Log(() => rightModel.clone());
    this.leftState = new JsonCrdtModelState();
    this.rightState = new JsonCrdtModelState();
    this.leftState.showModel$.next(false);
    this.leftState.showView$.next(false);
    this.leftState.showDisplay$.next(true);
    this.rightState.showModel$.next(false);
    this.rightState.showView$.next(false);
    this.rightState.showDisplay$.next(true);
  }
}
