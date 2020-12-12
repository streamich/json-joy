/* tslint:disable */

import {spawnSync} from 'child_process';
import tests_json from './test/tests.json';
import spec_json from './test/spec.json';
import {validateOperation} from '../json-patch';
const equal = require('fast-deep-equal');

const bin = String(process.argv[2]);

if (!bin) {
  console.error('First argument should be argument to json-patch binary.');
  process.exit(1);
}

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

testSuites.forEach((suite) => {
  suite.tests.forEach((test: any) => {
    if (test.disabled) return;
    const testName = test.comment || test.error || JSON.stringify(test.patch);
    if (test.expected) {
      test.patch.forEach(validateOperation);
      const {stdout} = spawnSync(bin, [JSON.stringify(test.doc), JSON.stringify(test.patch)]);
      const result = JSON.parse(stdout.toString());
      const isCorrect = equal(result, test.expected);
      if (isCorrect) console.log('✅ ' + testName);
      else console.error('🛑 ' + testName);
    } else if (test.error || test.patch[0].op === 'test') {
      const {status} = spawnSync(bin, [JSON.stringify(test.doc), JSON.stringify(test.patch)]);
      if (status === 0) console.error('🛑 should fail: ' + testName);
      else console.log('✅ should fail: ' + testName);
    } else throw new Error('invalid test case');
  });
});
