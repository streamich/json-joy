/**
 * npx ts-node src/json-crdt/__bench__/bench.traces.non-crdt-libs.ts
 */

import {runTraceMatrix} from './util/execute';

// prettier-ignore
runTraceMatrix({
  traces: ['friendsforever_flat', 'sveltecomponent', 'rustcode', 'seph-blog1', 'automerge-paper'],
  editors: ['StrNode (json-joy)', 'diamond-types-node', 'rope.js', 'V8 strings'],
  iterationsPerEditor: 50,
});
