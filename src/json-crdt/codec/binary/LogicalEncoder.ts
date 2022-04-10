import {ITimestamp} from '../../../json-crdt-patch/clock';
import {ClockEncoder} from '../../../json-crdt-patch/codec/clock/ClockEncoder';
import {Model} from '../../model';
import {AbstractEncoder} from './AbstractEncoder';

export class LogicalEncoder extends AbstractEncoder {
  protected clockEncoder!: ClockEncoder;

  public encode(model: Model): Uint8Array {
    model.advanceClocks();
    this.reset();
    this.clockEncoder = new ClockEncoder(model.clock);
    this.encodeRoot(model.root);
    const data = this.flush();
    this.encodeClockTable(data);
    return this.flush();
  }

  protected encodeClockTable(data: Uint8Array) {
    const {clockEncoder} = this;
    const length = clockEncoder.table.size;
    const dataSize = data.byteLength;
    this.uint8 = new Uint8Array(8 + 12 * length + dataSize);
    this.view = new DataView(this.uint8.buffer, this.uint8.byteOffset, this.uint8.byteLength);
    this.offset = 0;
    this.b1vuint56(false, length);
    for (const sid of clockEncoder.table.keys()) {
      const ts = clockEncoder.clock.clocks.get(sid);
      if (ts) this.uint53vuint39(sid, ts.time);
      else if (sid === clockEncoder.clock.getSessionId()) this.uint53vuint39(sid, 0);
      else {
        // Should never happen.
      }
    }
    this.buf(data, dataSize);
  }
  protected ts(ts: ITimestamp) {
    const relativeId = this.clockEncoder.append(ts);
    this.id(relativeId.sessionIndex, relativeId.timeDiff);
  }
}
