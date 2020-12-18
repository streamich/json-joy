/* tslint:disable */

import {spawnSync} from 'child_process';
const equal = require('fast-deep-equal');

const bin = String(process.argv[2]);

if (!bin) {
  console.error('First argument should be argument to json-patch binary.');
  process.exit(1);
}

interface TestCase {
  name: string;
  doc: unknown;
  pointer: string;
  result?: unknown;
  error?: string;
}

const testCases: TestCase[] = [
  {
    name: 'Retrieves first level key from object',
    doc: {foo: 'bar'},
    pointer: '/foo',
    result: 'bar',
  },
];

let cntCorrect = 0;
let cntFailed = 0;

for (const {name, doc, pointer, result, error} of testCases) {
  const {stdout} = spawnSync(bin, [pointer], {input: JSON.stringify(doc)});
  let isCorrect = false;
  if (error === undefined) {
    isCorrect = equal(result, JSON.parse(stdout.toString()));
  } else {
    const errorMessage = stdout.toString().trim();
    isCorrect = errorMessage === error;
  }
  if (isCorrect) {
    cntCorrect++;
    console.log('✅ ' + name);
  } else {
    cntFailed++;
    console.error('🛑 ' + name);
  }
}

console.log('');
console.log(`Successful = ${cntCorrect}, Failed = ${cntFailed}, Total = ${testCases.length}`);
console.log('');

if (cntFailed > 0) process.exit(1);
