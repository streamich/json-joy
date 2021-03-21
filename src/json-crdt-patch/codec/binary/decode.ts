import {LogicalClock, LogicalTimestamp} from "../../../json-crdt/clock";
import {Patch} from "../../Patch";
import {PatchBuilder} from "../../PatchBuilder";

export const decodeTimestamp = (buf: Uint32Array): LogicalTimestamp => {
  const low = buf[0];
  const high = buf[1];
  const sessionId = ((high >>> 24) * 0x01_00_00_00_00) + low;
  const time = high & 0xFFFFFF;
  return new LogicalTimestamp(sessionId, time);
};

// export const decode = (buf: Uint8Array): Patch => {
//   const id = decodeTimeStamp(buf, 0);
//   let offset = 8;
//   const clock = new LogicalClock(id.sessionId, id.time);
//   const builder = new PatchBuilder(clock);

//   return builder.patch;
// };
