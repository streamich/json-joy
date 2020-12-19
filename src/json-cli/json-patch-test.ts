/* tslint:disable */

import {spawnSync} from 'child_process';
import {validateOperation} from '../json-patch';
import { testSuites } from './test/suites';
const equal = require('fast-deep-equal');

const bin = String(process.argv[2]);

if (!bin) {
  console.error('First argument should be argument to json-patch binary.');
  process.exit(1);
}

let cntCorrect = 0;
let cntFailed = 0;

testSuites.forEach((suite) => {
  console.log('');
  console.log(suite.name);
  console.log('');

  suite.tests.forEach((test: any) => {
    if (test.disabled) return;
    const testName = test.comment || test.error || JSON.stringify(test.patch);
    if (test.expected !== undefined) {
      test.patch.forEach(validateOperation);
      let isCorrect = false;
      try {
        const {stdout} = spawnSync(bin, [JSON.stringify(test.patch)], {input: JSON.stringify(test.doc)});
        const result = JSON.parse(stdout.toString());
        isCorrect = equal(result, test.expected);
      } catch {
        isCorrect = false;
      }
      if (isCorrect) {
        cntCorrect++
        console.log('✅ ' + testName);
      } else {
        cntFailed++;
        console.error('🛑 ' + testName);
      }
    } else if (test.error) {
      const {status, stdout, stderr} = spawnSync(bin, [JSON.stringify(test.doc), JSON.stringify(test.patch)]);
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
  });
});

console.log('');
console.log(`Successful = ${cntCorrect}, Failed = ${cntFailed}, Total = ${cntCorrect + cntFailed}`);
console.log('');

if (cntFailed > 0) process.exit(1);

