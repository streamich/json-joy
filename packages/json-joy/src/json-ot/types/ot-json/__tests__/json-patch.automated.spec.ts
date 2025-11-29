import {apply} from '../apply';
import {toJsonOp} from '../json-patch';
import {testSuites} from '../../../../json-cli/test/suites';
import {validateOperation} from '../../../../json-patch';

describe('automated', () => {
  const length = testSuites.length;
  for (let i = 0; i < length; i++) {
    const suite = testSuites[i];
    if (!suite.isJsonPatchSpec) continue;
    describe(suite.name, () => {
      for (const test of suite.tests) {
        if (test.skipInJsonOt) return;
        if (test.disabled) return;
        const testName = test.comment || test.error || JSON.stringify(test.patch);
        if (test.expected !== undefined) {
          (test.only ? it.only : it)(testName, () => {
            const op = toJsonOp(test.patch);
            // console.log(JSON.stringify(op, null, 4));
            let doc = apply(test.doc, op);
            if (doc === undefined) doc = null;
            expect(doc).toEqual(test.expected);
          });
        } else if (typeof test.error === 'string') {
          (test.only ? it.only : it)(testName, () => {
            expect(() => {
              test.patch.forEach(validateOperation as any);
              const op = toJsonOp(test.patch);
              apply(test.doc, op);
            }).toThrow();
          });
        } else throw new Error('invalid test case');
      }
    });
  }
});
