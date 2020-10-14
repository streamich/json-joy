import tests_json from '../../__tests__/tests.json';
import spec_json from '../../__tests__/spec.json';
import { Operation } from '../../types';
import {applyPatch as v1} from '../v1';
import {applyPatch as v2} from '../v2';
import {applyPatch as v3} from '../v3';
import {applyPatch as v4} from '../v4';
import {validateOperation} from '../../validate';
import { deepClone } from '../../util';

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

const versions = {v1, v3, v4};
// const versions = {v3};

for (const name in versions) {
  const applyPatch = (versions as any)[name];
  describe(`applyPatch ${name}`, () => {
    testSuites.forEach((s) => {
      const suite = deepClone(s) as any;
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
}
