import type {ITimestamp} from '../../../json-crdt-patch/clock';
import {Model} from '../../model';
import {AbstractEncoder} from './AbstractEncoder';
import {
  JsonCrdtServerTimestamp,
  JsonCrdtServerSnapshot,
} from './types';

export class ServerEncoder extends AbstractEncoder<JsonCrdtServerTimestamp> {
  public encode(model: Model): JsonCrdtServerSnapshot {
    const snapshot: JsonCrdtServerSnapshot = {
      time: model.clock.time,
      root: this.encodeRoot(model.root),
    };
    return snapshot;
  }

  public encodeTimestamp(ts: ITimestamp): JsonCrdtServerTimestamp {
    return ts.time;
  }
}
