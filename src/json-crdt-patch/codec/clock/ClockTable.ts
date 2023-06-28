import {ITimestampStruct, IVectorClock, Timestamp} from '../../clock';
import {CrdtDecoder} from '../../util/binary/CrdtDecoder';
import {CrdtWriter} from '../../util/binary/CrdtEncoder';

export class ClockTableEntry {
  constructor(public index: number, public id: ITimestampStruct) {}
}

export class ClockTable {
  public static from(clock: IVectorClock): ClockTable {
    const table = new ClockTable();
    table.push(new Timestamp(clock.sid, clock.time - 1));
    clock.peers.forEach((id) => table.push(id));
    return table;
  }

  public static decode(reader: CrdtDecoder): ClockTable {
    const clockTable = new ClockTable();
    const length = reader.vu57();
    const tuple = reader.u53vu39();
    clockTable.push(new Timestamp(tuple[0], tuple[1]));
    for (let i = 1; i < length; i++) {
      const tuple = reader.u53vu39();
      clockTable.push(new Timestamp(tuple[0], tuple[1]));
    }
    return clockTable;
  }

  public readonly bySid: Map<number, ClockTableEntry> = new Map<number, ClockTableEntry>();
  public readonly byIdx: ITimestampStruct[] = [];

  public reset() {
    this.bySid.clear();
    this.byIdx.length = 0;
  }

  public parseField(field: `${string}_${string}`): ITimestampStruct {
    const underscoreIndex = field.indexOf('_');
    const relativeSid = parseInt(field.slice(0, underscoreIndex), 36);
    const time = parseInt(field.slice(underscoreIndex + 1), 36);
    const clock = this.byIdx[relativeSid];
    return new Timestamp(clock.sid, time);
  }

  public relative(id: ITimestampStruct): ITimestampStruct {
    const relativeSid = this.getBySid(id.sid).index;
    return new Timestamp(relativeSid, id.time);
  }

  public push(id: ITimestampStruct): void {
    const byIdx = this.byIdx;
    const index = byIdx.length;
    byIdx.push(id);
    this.bySid.set(id.sid, new ClockTableEntry(index, id));
  }

  public getBySid(sid: number): ClockTableEntry {
    const entry = this.bySid.get(sid);
    if (!entry) throw new Error('CLOCK_NOT_FOUND');
    return entry;
  }

  public getByIdx(index: number): ITimestampStruct {
    const clock = this.byIdx[index];
    if (!clock) throw new Error('CLOCK_NOT_FOUND');
    return clock;
  }

  public write(writer: CrdtWriter): void {
    const table = this.byIdx;
    const length = table.length;
    writer.vu39(length);
    for (let i = 0; i < length; i++) {
      const clock = table[i];
      writer.u53vu39(clock.sid, clock.time);
    }
  }

  public read(reader: CrdtDecoder): void {
    const length = reader.vu39();
    const bySid = this.bySid;
    const byIdx = this.byIdx;
    for (let i = 0; i < length; i++) {
      const [sid, time] = reader.u53vu39();
      const index = byIdx.length;
      const clock = new Timestamp(sid, time);
      const entry = new ClockTableEntry(index, clock);
      byIdx.push(clock);
      bySid.set(sid, entry);
    }
  }
}
