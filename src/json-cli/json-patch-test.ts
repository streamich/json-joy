/* tslint:disable */

import {spawnSync} from 'child_process';
import {validateOperation} from '../json-patch';
import {deepEqual} from '@jsonjoy.com/util/lib/json-equal/deepEqual';
import {testSuites} from './test/suites';

const bin = String(process.argv[2]);

if (!bin) {
  console.error('First argument should be argument to json-patch binary.');
  process.exit(1);
}

let cntCorrect = 0;
let cntFailed = 0;

for (const suite of testSuites) {
  console.log('');
  console.log(suite.name);
  console.log('');

  for (const test of suite.tests) {
    if (test.disabled) break;
    const testName = test.comment || test.error || JSON.stringify(test.patch);
    if (test.expected !== undefined) {
      test.patch.forEach(validateOperation as any);
      let isCorrect = false;
      let result: unknown;
      try {
        const input = JSON.stringify(test.doc);
        const {stdout} = spawnSync(bin, [JSON.stringify(test.patch)], {input});
        result = JSON.parse(stdout.toString());
        isCorrect = deepEqual(result, test.expected);
      } catch {
        isCorrect = false;
      }
      if (isCorrect) {
        cntCorrect++;
        console.log('✅ ' + testName);
      } else {
        cntFailed++;
        console.error('🛑 ' + testName);
        console.log('Expected:');
        console.log(test.expected);
        console.log('Received:');
        console.log(result);
      }
    } else if (test.error) {
      const input = JSON.stringify(test.doc);
      const {status, stdout, stderr} = spawnSync(bin, [JSON.stringify(test.patch)], {input});
      let isCorrect = true;
      if (status === 0) isCorrect = false;
      const output = stderr.toString().trim() || stdout.toString().trim();
      if (output !== test.error) isCorrect = false;
      if (!isCorrect) {
        cntFailed++;
        console.error('🛑 ' + testName);
        if (output !== test.error) {
          console.error('Expected: ', test.error);
          console.error('Received: ', output);
        }
      } else {
        cntCorrect++;
        console.log('✅ ' + testName);
      }
    } else {
      throw new Error('invalid test case');
    }

    if (cntFailed) process.exit(1);
  }
}

console.log('');
console.log(`Successful = ${cntCorrect}, Failed = ${cntFailed}, Total = ${cntCorrect + cntFailed}`);
console.log('');

if (cntFailed > 0) process.exit(1);
