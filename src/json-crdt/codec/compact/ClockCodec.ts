import type {json_string} from "ts-brand-json";
import {VectorClock, LogicalTimestamp} from "../../../json-crdt-patch/clock";

/**
 * Responsible for encoding and decoding the vector clock. Encodes all logical
 * timestamps as relative values. Session ID is encoded as a reference to clock
 * table. Logical time is encoded as relative time difference with the latest
 * value of that clock.
 */
export class ClockCodec {
  constructor (public readonly clock: VectorClock, public readonly table: Map<number, LogicalTimestamp> = new Map()) {}

  /**
   * Serializes the vector clock into a JSON string.
   * 
   * - Output is a plain array with just number entries.
   * - Each two subsequent numbers represent a (session ID, time) tuple.
   * - The first tuple is the local clock.
   */
  public encodeClock(): json_string<number[]> {
    const {clock} = this;
    let str: string = '[' + clock.sessionId + ',' + clock.time;
    this.table.set(1, clock);
    let i = 2;
    for (const c of clock.clocks.values()) {
      if (c.sessionId !== clock.sessionId) {
        str += ',' + c.sessionId + ',' + c.time;
        this.table.set(i++, c);
      }
    }
    return str + ']' as json_string<number[]>;
  }

  /**
   * Decodes serialized vector clock.
   */
  public static decodeClock(data: number[]): VectorClock {
    const table: Map<number, LogicalTimestamp> = new Map();
    const [sessionId, time] = data;
    const clock = new VectorClock(sessionId, time);
    table.set(1, clock);
    const length = data.length;
    let j = 2;
    let i = 2;
    while (i < length) {
      const sessionId = data[i++];
      const time = data[i++];
      const timestamp = new LogicalTimestamp(sessionId, time);
      table.set(j++, timestamp);
      clock.observe(timestamp, 1);
    }
    return clock;
  }
}