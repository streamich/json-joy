import {type ITimestampStruct, type IClockVector, tick, Timestamp} from '../../clock';
import {RelativeTimestamp} from './RelativeTimestamp';

class ClockTableEntry {
  constructor(
    public index: number,
    public clock: ITimestampStruct,
  ) {}
}

export class ClockEncoder {
  public readonly table: Map<number, ClockTableEntry> = new Map<number, ClockTableEntry>();
  /** Start from 1, as 0 is reserved for system session ID. */
  protected index: number = 1;
  public clock: IClockVector | null = null;

  public reset(clock: IClockVector) {
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
      let clock = this.clock!.peers.get(sid);
      if (!clock) clock = new Timestamp(sid, this.clock!.time - 1);
      entry = new ClockTableEntry(this.index++, clock);
      this.table.set(sid, entry);
    }
    const clock = entry.clock;
    const timeDiff = clock.time - time;
    if (timeDiff < 0) throw new Error('TIME_TRAVEL');
    return new RelativeTimestamp(entry.index, timeDiff);
  }

  public toJson(): number[] {
    const out: number[] = [];
    // biome-ignore lint: using .forEach() on Map is the fastest way to iterate
    this.table.forEach((entry) => {
      const clock = entry.clock;
      out.push(clock.sid, clock.time);
    });
    return out;
  }
}
