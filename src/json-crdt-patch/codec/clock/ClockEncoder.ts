import {ITimestampStruct, IVectorClock, tick} from '../../clock';
import {RelativeTimestamp} from './RelativeTimestamp';

class ClockTableEntry {
  constructor(public index: number, public clock: ITimestampStruct) {}
}

export class ClockEncoder {
  public readonly table: Map<number, ClockTableEntry> = new Map<number, ClockTableEntry>();
  /** Start from 1, as 0 is reserved for system session ID. */
  protected index: number = 1;
  public clock: IVectorClock | null = null;

  public reset(clock: IVectorClock) {
    this.index = 1;
    this.clock = clock;
    const entry = new ClockTableEntry(this.index++, tick(clock, -1));
    this.table.clear();
    this.table.set(clock.sid, entry);
  }

  public append(ts: ITimestampStruct): RelativeTimestamp {
    const time = ts.time;
    const sid = ts.sid;
    let entry = this.table.get(sid);
    if (!entry) {
      const clock = this.clock!.peers.get(sid)!;
      entry = new ClockTableEntry(this.index++, clock);
      this.table.set(sid, entry);
    }
    const clock = entry.clock;
    const timeDiff = clock.time - time;
    return new RelativeTimestamp(entry.index, timeDiff);
  }

  public toJson(): number[] {
    const out: number[] = [];
    this.table.forEach((entry) => {
      const clock = entry.clock;
      out.push(clock.sid, clock.time);
    });
    return out;
  }
}
