/**
 * node benchmarks/json-crdt/bench.traces.crdt-libs.js
 * NODE_ENV=production node --prof benchmarks/json-crdt/bench.traces.crdt-libs.js
 * node --prof-process isolate-0xnnnnnnnnnnnn-v8.log
 */

const {traces} = require('../data/editing-traces');
const {runTrace} = require('./util/editors');
const os = require('os');

const traceList = [
  'friendsforever_flat',
  'sveltecomponent',
  'rustcode',
  'seph-blog1',
  'automerge-paper',
];

const editorList = [
  'StringRga (json-joy)',
  // 'Y.js',
  // 'Y.rs',
  // 'AutomergeUnstable',
  // 'Automerge',
];

const runTraceWithAllEditors = (traceName, iterations) => {
  const trace = traces.get(traceName);
  const version = process.version;
  const arch = os.arch();
  const cpu = os.cpus()[0].model;
  console.log('');
  console.log('');
  console.log('============================================================================');
  console.log('Node.js =', version, ', Arch =', arch, ', CPU =', cpu);
  console.log('============================================================================');
  console.log('Editing trace:', JSON.stringify(traceName), ', Txs:', trace.txns.length, ', Len:', trace.endContent.length);
  for (const editorName of editorList) {
    runTrace(traceName, editorName, iterations);
  }
  console.log('');
};

for (const traceName of traceList) {
  runTraceWithAllEditors(traceName, 50);
}
