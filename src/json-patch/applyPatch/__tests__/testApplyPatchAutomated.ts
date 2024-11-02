import tests_json from '../../__tests__/tests.json';
import spec_json from '../../__tests__/spec.json';
import {validateOperation} from '../../validate';
import {clone} from '@jsonjoy.com/util/lib/json-clone/clone';
import type {ApplyPatch} from '../types';

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

export const testApplyPatchAutomated = (applyPatch: ApplyPatch) => {
  describe('applyPatch [automated]', () => {
    for (const s of testSuites) {
      const suite = clone(s) as any;
      describe(suite.name, () => {
        for (const test of suite.tests) {
          if (test.disabled) return;
          const testName = test.comment || test.error || JSON.stringify(test.patch);
          if (test.expected) {
            it('should succeed: ' + testName, () => {
              test.patch.forEach(validateOperation);
              const {doc} = applyPatch(test.doc, test.patch, {mutate: true});
              expect(doc).toEqual(test.expected);
            });
          } else if (test.error || test.patch[0].op === 'test') {
            it('should throw an error: ' + testName, () => {
              expect(() => {
                test.patch.forEach(validateOperation);
                applyPatch(test.doc, test.patch, {mutate: true});
              }).toThrow();
            });
          } else throw new Error('invalid test case');
        }
      });
    }
  });
};
