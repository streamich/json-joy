import tests_json from './tests.json';
import op_add_tests_json from './op.add.tests.json';
import op_replace_tests_json from './op.replace.tests.json';
import op_remove_tests_json from './op.remove.tests.json';
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
    name: 'JSON Patch "add" operation',
    tests: op_add_tests_json,
  },
  {
    name: 'JSON Patch "replace" operation',
    tests: op_replace_tests_json,
  },
  {
    name: 'JSON Patch "remove" operation',
    tests: op_remove_tests_json,
  },
];
