import {SequentialTraceName} from "../../../__bench__/util/types";
import {runTrace} from '../../../__bench__/util/execute';
import {traces} from '../../../__bench__/util/traces';
import {editors} from "../../../__bench__/util/editors";

const traceNames: SequentialTraceName[] = [
  "automerge-paper",
  "friendsforever_flat",
  "rustcode",
  "seph-blog1",
  "sveltecomponent",
];

describe('can correctly execute sequential traces', () => {
  const editor = editors["StringRga (json-joy)"];
  for (const traceName of traceNames) {
    test(`"${traceName}" trace`, async () => {
      const trace = traces.get(traceName);
      const editorInstance = runTrace(trace, editor);
      expect(editorInstance.get()).toBe(trace.endContent);
    });
  }
});
