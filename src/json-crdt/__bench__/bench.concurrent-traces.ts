/* tslint:disable no-console */
// npx ts-node src/json-crdt/__bench__/bench.concurrent-traces.ts

import {convertConcurrentTraceToPatches, loadConcurrentTrace} from './util/concurrent-trace-patch-builder';
import {Patch} from '../../json-crdt-patch';
import {Model} from '../model';

const traceName = 'friendsforever';
const json = loadConcurrentTrace(traceName);
const batch = convertConcurrentTraceToPatches(json);

const timeBatchRun = (batch: Patch[]) => {
  const model = Model.withLogicalClock(123123123);
  const start = performance.now();
  model.applyBatch(batch);
  const end = performance.now();
  const ms = end - start;
  return {
    start,
    end,
    ms,
    model,
  };
};

const timeAndReportBatchRun = (batch: Patch[]) => {
  const res = timeBatchRun(batch);
  console.log('Time:', res.ms.toFixed(2) + 'ms', ',', 'Correct:', res.model.view() === json.endContent ? '✅' : '❌');
};

for (let i = 0; i < 50; i++) {
  timeAndReportBatchRun(batch);
}
