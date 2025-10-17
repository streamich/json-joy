import {type ITimestampStruct, type IClockVector, Timestamp} from '../../clock';
import type {CrdtReader} from '../../util/binary/CrdtReader';
import type {CrdtWriter} from '../../util/binary/CrdtWriter';

export class ClockTableEntry {
  constructor(
    public index: number,
    public id: ITimestampStruct,
  ) {}
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
    clockTable.push(new Timestamp(reader.vu57(), reader.vu57()));
    for (let i = 1; i < length; i++) clockTable.push(new Timestamp(reader.vu57(), reader.vu57()));
    return clockTable;
  }

  public readonly bySid: Map<number, ClockTableEntry> = new Map<number, ClockTableEntry>();
  public readonly byIdx: ITimestampStruct[] = [];

  public parseField(field: `${string}_${string}`): ITimestampStruct {
    const underscoreIndex = field.indexOf('_');
    const relativeSid = Number.parseInt(field.slice(0, underscoreIndex), 36);
    const time = Number.parseInt(field.slice(underscoreIndex + 1), 36);
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
    writer.vu57(length);
    for (let i = 0; i < length; i++) {
      const clock = table[i];
      writer.vu57(clock.sid);
      writer.vu57(clock.time);
    }
  }
}
