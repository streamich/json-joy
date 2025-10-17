import {runTrace} from '../__bench__/util/execute/runTrace';
import {sequentialTraceNames, traces} from '../__bench__/util/traces';
import {editorJsonJoy as editor} from '../__bench__/util/editors/json-joy';
import {Model} from '../model';
import {loadConcurrentTrace} from '../__bench__/util/concurrent-trace';
import {loadFuzzerTrace} from '../__bench__/util/fuzzer-traces';

describe('sequential traces', () => {
  for (const traceName of sequentialTraceNames) {
    test(`"${traceName}" trace`, async () => {
      const trace = traces.get(traceName);
      const editorInstance = runTrace(trace, editor);
      expect(editorInstance.get()).toBe(trace.endContent);
    });
  }
});

describe('concurrent traces', () => {
  const traces: string[] = ['friendsforever', 'clownschool'];
  for (const traceName of traces) {
    test(`"${traceName}" trace`, async () => {
      const [batch, view] = loadConcurrentTrace(traceName);
      const model = Model.create(void 0, 123123123);
      model.applyBatch(batch);
      expect(model.view()).toBe(view);
    });
  }
});

describe('fuzzer traces', () => {
  const traces = [
    <const>'trace-1',
    <const>'trace-2',
    <const>'trace-3',
    <const>'long',
    <const>'short',
    <const>'low-concurrency',
    <const>'high-concurrency',
    <const>'str-only',
    <const>'bin-only',
  ];

  for (const traceName of traces) {
    test(`"${traceName}" trace`, async () => {
      const [batch, doc] = loadFuzzerTrace(traceName);
      const model = Model.create(void 0, 1000000);
      model.applyBatch(batch);
      expect(Model.fromBinary(model.toBinary()).toString()).toBe(doc.toString());
      expect(model.view()).toStrictEqual(doc.view());
    });
  }
});
