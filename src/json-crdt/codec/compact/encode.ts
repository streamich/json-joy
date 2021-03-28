import {json_string} from "ts-brand-json";
import {Document} from "../../document";
import {NumberType} from "../../types/lww-number/NumberType";
import {ObjectType} from "../../types/lww-object/ObjectType";
import {ClockCodec} from "./ClockCodec";

export const encode = (doc: Document): json_string<unknown[]> => {
  const clockCodec = new ClockCodec(doc.clock, new Map());
  const clockData = clockCodec.encode();
  const root = doc.root.last;

  let str = '[' + clockData + ',' +
    (root
      ? (clockCodec.encodeTs(root.id) + ',' + clockCodec.encodeTs(root.value))
      : '0');

  for (const m of doc.nodes.entries.values()) {
    for (const node of m.values()) {
      if (node.id.sessionId === 0) continue;
      else if (node instanceof ObjectType) {
        str += ',' + node.serialize(clockCodec);
      } else if (node instanceof NumberType) {
        str += ',' + node.serialize(clockCodec);
      }
    }
  }

  return str + ']' as json_string<Array<number | string>>;
};
