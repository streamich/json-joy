import {applyPatch} from '../applyPatch';
import {testSuites} from '../../json-cli/test/suites';
import {validateOperation} from '../validate';

describe('automated', () => {
  for (const suite of testSuites) {
    describe(suite.name, () => {
      for (const test of suite.tests) {
        if (test.disabled) return;
        const testName = test.comment || test.error || JSON.stringify(test.patch);
        if (test.expected !== undefined) {
          it(testName, () => {
            const {doc} = applyPatch(test.doc, test.patch, {mutate: true});
            expect(doc).toEqual(test.expected);
          });
        } else if (typeof test.error === 'string') {
          it(testName, () => {
            try {
              test.patch.forEach(validateOperation as any);
              applyPatch(test.doc, test.patch, {mutate: true});
              throw new Error('Patch should have failed.');
            } catch (error) {
              const output = typeof error === 'string' ? error : error instanceof Error ? error.message : String(error);
              expect(output).toBe(test.error);
            }
          });
        } else throw new Error('invalid test case');
      }
    });
  }
});
