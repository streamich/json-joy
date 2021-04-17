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
    const firstTimestamp = this.uint53vuint39();
    this.clockDecoder = new ClockDecoder(firstTimestamp[0], firstTimestamp[1]);
    for (let i = 1; i < length; i++) {
      const ts = this.uint53vuint39();
      this.clockDecoder.pushTuple(ts[0], ts[1]);
    }
  }

  protected ts(): ITimestamp {
    const id = this.id();
    return this.clockDecoder.decodeId(id[0], id[1]);
  }
}
