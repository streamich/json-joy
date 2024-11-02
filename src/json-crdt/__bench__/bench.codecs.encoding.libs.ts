// npx ts-node src/json-crdt/__bench__/bench.codecs.encoding.libs.ts

import {payloads} from '../../__bench__/payloads';
import {type IBenchmark, runBenchmarkAndSave} from '../../__bench__/runBenchmark';
import {type StructuralEditors, structuralEditors} from './util/structural-editors';
import type {StructuralEditor} from './util/types';

const editors: StructuralEditors[] = ['nativeJs', 'jsonJoy'];

const benchmark: IBenchmark = {
  name: 'CRDT libraries JSON documents',
  description:
    'This benchmarks tests encoding speed of various JSON documents by CRDT libraries.' +
    '\n\n' +
    'This benchmark constructs a JSON document and serializes its model. For libraries, that cannot serialize just the model, the whole document is serialized.',
  warmup: 1000,
  payloads,
  runners: [
    ...editors
      .map((name) => structuralEditors[name])
      .map((editor: StructuralEditor) => ({
        name: editor.name,
        setup: (json: any) => {
          let instance = editor.factory();
          instance.setRoot(json);
          return () => {
            const blob = instance.toBlob();
            instance = editor.factory(blob);
          };
        },
      })),
  ],
};

runBenchmarkAndSave(benchmark, __dirname + '/results');
