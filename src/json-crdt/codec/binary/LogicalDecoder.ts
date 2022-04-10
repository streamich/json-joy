import {ITimestamp} from '../../../json-crdt-patch/clock';
import {ClockDecoder} from '../../../json-crdt-patch/codec/clock/ClockDecoder';
import {Model} from '../../model';
import {AbstractDecoder} from './AbstractDecoder';

export class LogicalDecoder extends AbstractDecoder {
  protected clockDecoder!: ClockDecoder;

  public decode(data: Uint8Array): Model {
    this.reset(data);
    const [, clockTableLength] = this.b1vuint56();
    this.decodeClockTable(clockTableLength);
    const doc = (this.doc = Model.withLogicalClock(this.clockDecoder.clock));
    this.decodeRoot(doc);
    return doc;
  }

  protected decodeClockTable(length: number): void {
    const [sessionId, time] = this.uint53vuint39();
    this.clockDecoder = new ClockDecoder(sessionId, 0);
    this.clockDecoder.pushTuple(sessionId, time);
    for (let i = 1; i < length; i++) {
      const ts = this.uint53vuint39();
      this.clockDecoder.pushTuple(ts[0], ts[1]);
    }
  }
  protected ts(): ITimestamp {
    const [sessionIndex, timeDiff] = this.id();
    const id = this.clockDecoder.decodeId(sessionIndex, timeDiff);
    return id;
  }
}
