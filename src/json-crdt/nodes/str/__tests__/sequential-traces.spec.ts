import {runTrace} from '../../../__bench__/util/execute';
import {sequentialTraceNames, traces} from '../../../__bench__/util/traces';
import {editors} from '../../../__bench__/util/editors';

describe('can correctly execute sequential traces', () => {
  const editor = editors['StrNode (json-joy)'];
  for (const traceName of sequentialTraceNames) {
    test(`"${traceName}" trace`, async () => {
      const trace = traces.get(traceName);
      const editorInstance = runTrace(trace, editor);
      expect(editorInstance.get()).toBe(trace.endContent);
    });
  }
});
