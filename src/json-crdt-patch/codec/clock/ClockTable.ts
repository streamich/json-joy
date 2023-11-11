import {ITimestampStruct, IClockVector, Timestamp} from '../../clock';
import {CrdtReader} from '../../util/binary/CrdtReader';
import {CrdtWriter} from '../../util/binary/CrdtWriter';

export class ClockTableEntry {
  constructor(public index: number, public id: ITimestampStruct) {}
}

export class ClockTable {
  public static from(clock: IClockVector): ClockTable {
    const table = new ClockTable();
    table.push(new Timestamp(clock.sid, clock.time - 1));
    clock.peers.forEach((id) => table.push(id));
    return table;
  }

  public static decode(reader: CrdtReader): ClockTable {
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

  public parseField(field: `${string}_${string}`): ITimestampStruct {
    const underscoreIndex = field.indexOf('_');
    const relativeSid = parseInt(field.slice(0, underscoreIndex), 36);
    const time = parseInt(field.slice(underscoreIndex + 1), 36);
    const clock = this.byIdx[relativeSid];
    return new Timestamp(clock.sid, time);
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

  public write(writer: CrdtWriter): void {
    const table = this.byIdx;
    const length = table.length;
    writer.vu39(length);
    for (let i = 0; i < length; i++) {
      const clock = table[i];
      writer.u53vu39(clock.sid, clock.time);
    }
  }
}
