import {runTrace} from '../__bench__/util/execute';
import {sequentialTraceNames, traces} from '../__bench__/util/traces';
import {editors} from '../__bench__/util/editors';
import {convertConcurrentTraceToPatches, loadConcurrentTrace} from '../__bench__/util/concurrent-trace-patch-builder';
import {Model} from '../model';

describe('sequential traces', () => {
  const editor = editors['json-joy'];
  for (const traceName of sequentialTraceNames) {
    test(`"${traceName}" trace`, async () => {
      const trace = traces.get(traceName);
      const editorInstance = runTrace(trace, editor);
      expect(editorInstance.get()).toBe(trace.endContent);
    });
  }
});

describe('concurrent traces', () => {
  const traces: string [] = [
    'friendsforever',
  ];  
  for (const traceName of traces) {
    test(`"${traceName}" trace`, async () => {
      const json = loadConcurrentTrace(traceName);
      const batch = convertConcurrentTraceToPatches(json);
      const model = Model.withLogicalClock(123123123);
      model.applyBatch(batch);
      expect(model.view()).toBe(json.endContent);
    });
  }
});
