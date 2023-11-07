// npx ts-node src/json-crdt/__bench__/bench.json.encoding.ts

import {payloads} from '../../__bench__/payloads';
import {runBenchmark, IBenchmark} from '../../__bench__/runBenchmark';;
import {CborEncoder} from '../../json-pack/cbor/CborEncoder';
import {Model} from '../model';

const benchmark: IBenchmark = {
  name: 'Encoding JSON documents',
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
        const model = Model.withLogicalClock();
        model.api.root(json);
        return () => model.toBinary();
      },
    },
    {
      name: 'Model.toBinary() - with server clock',
      setup: (json: any) => {
        const model = Model.withServerClock();
        model.api.root(json);
        return () => model.toBinary();
      },
    },
  ],
};

runBenchmark(benchmark);
