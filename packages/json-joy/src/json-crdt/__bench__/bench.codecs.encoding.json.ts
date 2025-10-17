// npx ts-node src/json-crdt/__bench__/bench.codecs.encoding.json.ts

import {payloads} from '../../__bench__/payloads';
import {type IBenchmark, runBenchmarkAndSave} from '../../__bench__/runBenchmark';
import {CborEncoder} from '@jsonjoy.com/json-pack/lib/cbor/CborEncoder';
import {Model} from '../model';

const benchmark: IBenchmark = {
  name: 'Encoding JSON documents',
  description:
    'This benchmarks tests encoding speed of JSON various JSON documents. It constructs a CRDT model from the JSON document and then encodes the model to binary.' +
    '\n\n' +
    'CRDT models are compared against native CBOR encoder and Node.js native `Buffer.from(JSON.stringify(obj))` plain object encoding to binary.' +
    '\n\n' +
    'Model "with logical" uses logical clock to timestamp CRDT operations. Model "with server" clock ignores the *session ID* part of logical timestamps, as those are always constant.',
  warmup: 1000,
  payloads,
  runners: [
    {
      name: 'json-joy/json-pack CborEncoder',
      setup: (json: any) => {
        const encoder = new CborEncoder();
        return () => encoder.encode(json);
      },
    },
    {
      name: 'Buffer.from(JSON.stringify(json))',
      setup: (json: any) => {
        return () => Buffer.from(JSON.stringify(json));
      },
    },
    {
      name: 'Model.toBinary() - with logical clock',
      setup: (json: any) => {
        const model = Model.create();
        model.api.set(json);
        return () => model.toBinary();
      },
    },
    {
      name: 'Model.toBinary() - with server clock',
      setup: (json: any) => {
        const model = Model.withServerClock();
        model.api.set(json);
        return () => model.toBinary();
      },
    },
  ],
};

runBenchmarkAndSave(benchmark, __dirname + '/results');
