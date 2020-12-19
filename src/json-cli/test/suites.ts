import tests_json from './tests.json';
import spec_json from './spec.json';
import { TestSuite } from './types';

export const testSuites: TestSuite[] = [
  {
    name: 'JSON Patch smoke tests',
    tests: tests_json,
  },
  {
    name: 'JSON Patch spec',
    tests: spec_json,
  },
];
