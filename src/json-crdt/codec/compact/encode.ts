import {json_string} from "ts-brand-json";
import {Document} from "../../document";
import {NumberType} from "../../types/lww-number/NumberType";
import {ObjectType} from "../../types/lww-object/ObjectType";
import {ClockCodec} from "./ClockCodec";

export const encode = (doc: Document): json_string<unknown[]> => {
  let nodes = '';

  const clockCodec = new ClockCodec(doc.clock, new Map());
  const vectorClockData = clockCodec.encodeVectorClock();

  for (const m of doc.nodes.entries.values()) {
    for (const node of m.values()) {
      if (node.id.sessionId === 0) continue;
      else if (node instanceof ObjectType) {
        nodes += ',' + node.serialize(clockCodec);
        continue;
      } else if (node instanceof NumberType) {
        nodes += ',' + node.serialize(clockCodec);
      }
    }
  }

  const root = doc.root.last;

  return '[' +
    vectorClockData + ',' +
    (root
      ? clockCodec.encodeTs(root.id) + ',' + clockCodec.encodeTs(root.value)
      : '0') +
    nodes +
  ']' as json_string<Array<number | string>>;
};
