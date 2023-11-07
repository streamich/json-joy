// npx ts-node src/json-crdt/__bench__/bench.json.libs.encoding.ts

import {payloads} from '../../__bench__/payloads';
import {IBenchmark, runBenchmarkAndSave} from '../../__bench__/runBenchmark';
import {structuralEditors} from './util/structural-editors';
import {StructuralEditor} from './util/types';

const benchmark: IBenchmark = {
  name: 'CRDT libraries JSON documents',
  description:
    'This benchmarks tests encoding speed of various JSON documents by CRDT libraries.' +
    '\n\n' +
    'This benchmark constructs a JSON document and serializes its model. For libraries, that cannot serialize just the model, the whole document is serialized.',
  warmup: 1000,
  payloads,
  runners: [
    ...Object.values(structuralEditors).map((editor: StructuralEditor) => ({
      name: editor.name,
      setup: () => {
        return (json: any) => {
          const instance = editor.factory();
          instance.setRoot(json);
          return instance.toBlob();
        };
      },
    })),
  ],
};

runBenchmarkAndSave(benchmark, __dirname + '/results');
