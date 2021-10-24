import {ITimestamp, LogicalTimestamp, IVectorClock, LogicalVectorClock} from '../../../json-crdt-patch/clock';
import {Model} from '../../model';
import {AbstractDecoder} from './AbstractDecoder';
import {JsonCrdtLogicalSnapshot, JsonCrdtLogicalTimestamp} from './types';

export class LogicalDecoder extends AbstractDecoder<JsonCrdtLogicalTimestamp> {
  public decode({clock, root}: JsonCrdtLogicalSnapshot): Model {
    const vectorClock = this.decodeClock(clock);
    const doc = Model.withLogicalClock(vectorClock as LogicalVectorClock);
    this.decodeRoot(doc, root);
    return doc;
  }

  protected decodeClock(timestamps: JsonCrdtLogicalTimestamp[]): IVectorClock {
    const [ts] = timestamps;
    const vectorClock = new LogicalVectorClock(ts[0], ts[1]);
    const length = timestamps.length;
    for (let i = 0; i < length; i++) {
      const ts = timestamps[i];
      const [sessionId, time] = ts;
      vectorClock.observe(new LogicalTimestamp(sessionId, time), 1);
    }
    return vectorClock;
  }

  protected decodeTimestamp([sessionId, time]: JsonCrdtLogicalTimestamp): ITimestamp {
    return new LogicalTimestamp(sessionId, time);
  }
}
