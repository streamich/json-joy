import {runTrace} from '../../../__bench__/util/execute/runTrace';
import {sequentialTraceNames, traces} from '../../../__bench__/util/traces';
import {editorStrNode as editor} from '../../../__bench__/util/editors/json-joy';

describe('can correctly execute sequential traces', () => {
  for (const traceName of sequentialTraceNames) {
    test(`"${traceName}" trace`, async () => {
      const trace = traces.get(traceName);
      const editorInstance = runTrace(trace, editor);
      expect(editorInstance.get()).toBe(trace.endContent);
    });
  }
});
