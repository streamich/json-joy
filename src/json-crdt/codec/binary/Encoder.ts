import {ITimestamp} from '../../../json-crdt-patch/clock';
import {ClockEncoder} from '../../../json-crdt-patch/codec/clock/ClockEncoder';
import {Model} from '../../model';
import {AbstractEncoder} from './AbstractEncoder';

export class Encoder extends AbstractEncoder {
  protected clockEncoder!: ClockEncoder;

  public encode(doc: Model): Uint8Array {
    this.reset();
    this.clockEncoder = new ClockEncoder(doc.clock);
    this.encodeRoot(doc.root);
    const data = this.flush();
    this.encodeClockTable(data);
    return this.flush();
  }

  protected encodeClockTable(data: Uint8Array) {
    const {clockEncoder} = this;
    const length = clockEncoder.table.size;
    const dataSize = data.byteLength;
    this.uint8 = new Uint8Array(8 + 12 * length + dataSize);
    this.view = new DataView(this.uint8.buffer);
    this.offset = 0;
    this.vuint57(length);
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
    const id = this.clockEncoder.append(ts);
    this.id(id.sessionIndex, id.timeDiff);
  }
}
