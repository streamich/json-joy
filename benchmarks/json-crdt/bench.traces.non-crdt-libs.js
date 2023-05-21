/**
 * node benchmarks/json-crdt/bench.traces.non-crdt-libs.js
 * NODE_ENV=production node --prof benchmarks/json-crdt/bench.traces.non-crdt-libs.js
 * node --prof-process isolate-0xnnnnnnnnnnnn-v8.log
 */

const {traces} = require('../data/editing-traces');
const {runTrace} = require('./util/editors');

const traceList = [
  'json-joy-crdt',
  'sveltecomponent',
  'rustcode',
  'seph-blog1',
  'automerge-paper',
];

const editorList = [
  'StringRga (json-joy)',
  'diamond-types-node',
  'rope.js',
  'V8 strings',
];

const runTraceWithAllEditors = (traceName, iterations) => {
  const trace = traces.get(traceName);
  console.log('');
  console.log('');
  console.log('============================================================================');
  console.log('Editing trace:', JSON.stringify(traceName), ', Transactions:', trace.txns.length, ', End length:', trace.endContent.length);
  for (const editorName of editorList) {
    runTrace(traceName, editorName, iterations);
  }
};

for (const traceName of traceList) {
  runTraceWithAllEditors(traceName, 50);
}
