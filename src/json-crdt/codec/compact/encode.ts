import {json_string} from "ts-brand-json";
import {Document} from "../../document";
import {ClockCodec} from "./ClockCodec";

export const encode = (doc: Document): json_string<unknown[]> => {
  const clockCodec = new ClockCodec(doc.clock, new Map());
  const clockData = clockCodec.encode();
  const root = doc.root.last;

  let str = '[' + clockData;

  if (!root) str += ',0';
  else {
    const node = doc.nodes.get(root.value)!;
    str += ',' + clockCodec.encodeTs(root.id) + ',' + node.encodeCompact(clockCodec);
  }

  return str + ']' as json_string<Array<number | string>>;
};
