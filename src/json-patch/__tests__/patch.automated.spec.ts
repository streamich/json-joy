import {applyPatch} from '../patch';
import {testSuites} from '../../json-cli/test/suites'
import { validateOperation } from '../validate';

describe('automated', () => {
  testSuites.forEach((suite) => {
    describe(suite.name, () => {
      suite.tests.forEach((test: any) => {
        if (test.disabled) return;
        const testName = test.comment || test.error || JSON.stringify(test.patch);
        if (test.expected !== undefined) {
          it(testName, () => {
            const {doc} = applyPatch(test.doc, test.patch, true);
            expect(doc).toEqual(test.expected);
          });
        } else if (typeof test.error === 'string') {
          it(testName, () => {
            try {
              test.patch.forEach(validateOperation);
              applyPatch(test.doc, test.patch, true);
              throw new Error('Patch should have failed.');
            } catch (error) {
              const output = typeof error === 'string' ? error : (error instanceof Error ? error.message : String(error));
              expect(output).toBe(test.error);
            }
            
          });
        } else throw new Error('invalid test case');
      });
    });
  });
});
