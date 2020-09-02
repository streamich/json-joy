import {applyPatch} from '../patch';

import tests_json from './tests.json';
import spec_json from './spec.json';
import {validateOperation} from '../validate';

const testSuites = [
  {
    name: 'tests.json',
    tests: tests_json,
  },
  {
    name: 'spec.json',
    tests: spec_json,
  },
];

describe('automated', () => {
  testSuites.forEach((suite) => {
    describe(suite.name, () => {
      suite.tests.forEach((test: any) => {
        if (test.disabled) return;
        const testName = test.comment || test.error || JSON.stringify(test.patch);
        if (test.expected) {
          it('should succeed: ' + testName, () => {
            test.patch.forEach(validateOperation);
            const {doc} = applyPatch(test.doc, test.patch, true);
            expect(doc).toEqual(test.expected);
          });
        } else if (test.error || test.patch[0].op === 'test') {
          it('should throw an error: ' + testName, () => {
            expect(() => {
              test.patch.forEach(validateOperation);
              applyPatch(test.doc, test.patch, true);
            }).toThrow();
          });
        } else throw new Error('invalid test case');
      });
    });
  });
});
