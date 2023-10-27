/**
 * npx ts-node src/json-crdt/__bench__/bench.traces.crdt-libs.ts
 */

import {runTraceMatrix} from './util/execute';

// prettier-ignore
runTraceMatrix({
  traces: [
    'friendsforever_flat',
    'sveltecomponent',
    'rustcode',
    'seph-blog1',
    'automerge-paper',
  ],
  editors: [
    'StringRga (json-joy)',
    'json-joy',
    // 'Y.js',
    // 'Y.rs',
    // 'AutomergeUnstable',
    // 'Automerge',
  ],
  iterationsPerEditor: 50,
});
