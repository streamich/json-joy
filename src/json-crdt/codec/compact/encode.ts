import {json_string} from "ts-brand-json";
import {Document} from "../../document";
import {LWWObjectType} from "../../lww-object/LWWObjectType";

export const encode = (doc: Document): json_string<Array<number | string>> => {
  let nodes = '';

  for (const m of doc.nodes.entries.values()) {
    for (const node of m.values()) {
      if (node.id.sessionId === 0) continue;
      if (node instanceof LWWObjectType) {
        nodes += ',' + node.serialize();
        continue;
      }
    }
  }

  const clock = doc.clock;
  const root = doc.root.last;

  return '[' +
    clock.sessionId + ',' +
    clock.time + ',' +
    (root
      ? root.id.sessionId + ',' + root.id.time + ',' + root.value.sessionId + ',' + root.value.time
      : '0') +
    nodes +
  ']' as json_string<Array<number | string>>;
};
