import type {json_string} from "ts-brand-json";
import {VectorClock, LogicalTimestamp} from "../../../json-crdt-patch/clock";

/**
 * Responsible for encoding and decoding the vector clock. Encodes all logical
 * timestamps as relative values. Session ID is encoded as a reference to clock
 * table. Logical time is encoded as relative time difference with the latest
 * value of that clock.
 */
export class ClockCodec {
  /** Clock index to clock. */
  public readonly table1: Map<number, LogicalTimestamp>;
  /** Clock session ID to clock index. */
  public readonly table2: Map<number, number> = new Map();

  constructor (public readonly clock: VectorClock, table1: Map<number, LogicalTimestamp>) {
    this.table1 = table1;
  }

  /**
   * Serializes the vector clock into a JSON string.
   * 
   * - Output is a plain array with just number entries.
   * - Each two subsequent numbers represent a (session ID, time) tuple.
   * - The first tuple is the local clock.
   */
  public encode(): json_string<number[]> {
    const {clock} = this;
    let str: string = '[' + clock.sessionId + ',' + clock.time;
    this.table2.set(clock.sessionId, 1);
    let i = 2;
    for (const c of clock.clocks.values()) {
      if (c.sessionId !== clock.sessionId) {
        str += ',' + c.sessionId + ',' + c.time;
        this.table2.set(clock.sessionId, i++);
      }
    }
    return str + ']' as json_string<number[]>;
  }

  /**
   * Decodes serialized vector clock.
   */
  public static decode(data: number[]): ClockCodec {
    const table1: Map<number, LogicalTimestamp> = new Map();
    const [sessionId, time] = data;
    const clock = new VectorClock(sessionId, time);
    table1.set(1, clock);
    const length = data.length;
    let j = 2;
    let i = 2;
    while (i < length) {
      const sessionId = data[i++];
      const time = data[i++];
      const timestamp = new LogicalTimestamp(sessionId, time);
      table1.set(j++, timestamp);
      clock.observe(timestamp, 1);
    }
    return new ClockCodec(clock, table1);
  }

  /**
   * Encodes a single timestamp using the clock table.
   * 
   * @param ts Timestamp to encode.
   * @returns Encoded timestamp tuple.
   */
  public encodeTs(ts: LogicalTimestamp): string {
    const {sessionId, time} = ts;
    const clockId = this.table2.get(sessionId);
    if (!clockId) return sessionId + ',' + time;
    const clock = this.clock.clocks.get(sessionId)!;
    return clockId + ',' + (clock.time - time);
  }

  /**
   * Decodes encoded timestamp using clock table.
   */
  public decodeTs(clockId: number, time: number): LogicalTimestamp {
    const clock = this.table1.get(clockId);
    if (!clock) return new LogicalTimestamp(clockId, time);
    return new LogicalTimestamp(clock.sessionId, clock.time - time);
  }
}
