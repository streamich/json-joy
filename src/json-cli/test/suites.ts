import tests_json from './tests.json';
import op_replace_tests_json from './op.replace.tests.json';
import spec_json from './spec.json';
import {TestSuite} from './types';

export const testSuites: TestSuite[] = [
  {
    name: 'JSON Patch spec',
    tests: spec_json,
  },
  {
    name: 'JSON Patch smoke tests',
    tests: tests_json,
  },
  {
    name: 'JSON Patch "replace" operation',
    tests: op_replace_tests_json,
  },
];
