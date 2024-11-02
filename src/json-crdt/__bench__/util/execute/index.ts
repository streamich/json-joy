import * as os from 'os';
import {traces} from '../traces';
import {editors, type SequentialEditorName} from '../editors';
import {runTrace} from './runTrace';
import type {SequentialTraceName} from '../types';

/* tslint:disable no-console */

function numberWithCommas(x: number) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export const runTraceWithEditor = (
  traceName: SequentialTraceName,
  editorName: SequentialEditorName,
  iterations = 1,
) => {
  const trace = traces.get(traceName);
  const editorFactory = editors[editorName];
  let instance: any, view: any;
  console.log('----------------------------------------------------------------------------');
  console.log(editorFactory.name);
  console.log('----------------------------------------------------------------------------');
  let best = Number.POSITIVE_INFINITY;
  let worst = 0;
  const measurements = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    instance = runTrace(trace, editorFactory);
    view = instance.get();
    const end = performance.now();
    const ms = end - start;
    if (ms < best) best = ms;
    if (ms > worst) worst = ms;
    measurements.push(ms);
    // console.log('#' + (i + 1) + ':', Number((ms).toFixed(1)));
    console.log(Number(ms.toFixed(3)));
  }
  // console.log('Result:', view);
  console.log(
    'Correct:',
    view === trace.endContent,
    'Length:',
    instance!.len(),
    'Chunks:',
    instance!.chunks(),
    'Bytes:',
    instance!.toBlob?.().length,
  );
  const avg = measurements.reduce((acc, x) => acc + x, 0) / measurements.length;
  console.log(
    'Best:',
    Number(best.toFixed(1)),
    'Worst:',
    Number(worst.toFixed(1)),
    'Average:',
    Number(avg.toFixed(1)),
    'Tx/sec:',
    numberWithCommas(Math.round(trace.txns.length / (avg / 1000))),
  );
};

export const runTraceWithEditorList = (
  traceName: SequentialTraceName,
  editors: SequentialEditorName[],
  iterations: number,
) => {
  const trace = traces.get(traceName);
  const version = process.version;
  const arch = os.arch();
  const cpu = os.cpus()[0].model;
  console.log('');
  console.log('');
  console.log('============================================================================');
  console.log('Node.js =', version, ', Arch =', arch, ', CPU =', cpu);
  console.log('============================================================================');
  console.log(
    'Editing trace:',
    JSON.stringify(traceName),
    ', Txs:',
    trace.txns.length,
    ', Len:',
    trace.endContent.length,
  );
  for (const editorName of editors) {
    runTraceWithEditor(traceName, editorName, iterations);
  }
  console.log('');
};

export const runTraceMatrix = ({traces, editors, iterationsPerEditor}: RunTraceMatrixOptions) => {
  for (const traceName of traces) {
    runTraceWithEditorList(traceName, editors, iterationsPerEditor);
  }
};

export interface RunTraceMatrixOptions {
  traces: SequentialTraceName[];
  editors: SequentialEditorName[];
  iterationsPerEditor: number;
}
