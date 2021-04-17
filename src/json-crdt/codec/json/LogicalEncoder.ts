import type {ITimestamp, IVectorClock} from '../../../json-crdt-patch/clock';
import {Model} from '../../model';
import {AbstractEncoder} from './AbstractEncoder';
import {
  JsonCrdtLogicalSnapshot,
  JsonCrdtLogicalTimestamp,
} from './types';

export class LogicalEncoder extends AbstractEncoder<JsonCrdtLogicalTimestamp> {
  public encode(model: Model): JsonCrdtLogicalSnapshot {
    const snapshot: JsonCrdtLogicalSnapshot = {
      clock: this.encodeClock(model.clock),
      root: this.encodeRoot(model.root),
    };
    return snapshot;
  }

  public encodeClock(clock: IVectorClock): JsonCrdtLogicalTimestamp[] {
    const data: JsonCrdtLogicalTimestamp[] = [];
    const sessionId = clock.getSessionId();
    const localTs = clock.clocks.get(sessionId);
    if (!localTs) data.push([sessionId, clock.time]);
    for (const c of clock.clocks.values()) data.push([c.getSessionId(), c.time]);
    return data;
  }

  public encodeTimestamp(ts: ITimestamp): JsonCrdtLogicalTimestamp {
    return [ts.getSessionId(), ts.time];
  }
}
