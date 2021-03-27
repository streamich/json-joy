import {json_string} from "ts-brand-json";
import {Document} from "../../document";
import {ObjectType} from "../../types/lww-object/ObjectType";

export const encode = (doc: Document): json_string<unknown[]> => {
  let nodes = '';

  for (const m of doc.nodes.entries.values()) {
    for (const node of m.values()) {
      if (node.id.sessionId === 0) continue;
      if (node instanceof ObjectType) {
        nodes += ',' + node.serialize();
        continue;
      }
    }
  }

  const clock = doc.clock;
  const root = doc.root.last;

  return '[' +
    clock.serialize() + ',' +
    (root
      ? root.id.sessionId + ',' + root.id.time + ',' + root.value.sessionId + ',' + root.value.time
      : '0') +
    nodes +
  ']' as json_string<Array<number | string>>;
};
