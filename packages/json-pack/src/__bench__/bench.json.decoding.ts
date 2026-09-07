// npx ts-node src/__bench__/bench.json.decoding.ts

import {type IBenchmark, runBenchmark} from '@jsonjoy.com/util/lib/bench/runBenchmark';
import {deepEqual} from '@jsonjoy.com/util/lib/json-equal/deepEqual';
import {payloads} from '../__bench__/payloads';
import {JsonDecoder} from '../json/JsonDecoder';

const encodedPayloads = payloads.map((payload) => {
  return {
    ...payload,
    data: Buffer.from(JSON.stringify(payload.data)),
  };
});

const benchmark: IBenchmark = {
  name: 'Decoding JSON',
  warmup: 1000,
  payloads: encodedPayloads,
  test: (payload: unknown, data: unknown): boolean => {
    const json = JSON.parse((payload as Buffer).toString());
    return deepEqual(json, data);
  },
  runners: [
    {
      name: 'json-pack JsonDecoder.decode()',
      setup: () => {
        const decoder = new JsonDecoder();
        return (json: any) => decoder.read(json);
      },
    },
    {
      name: 'Native JSON.parse(buf.toString())',
      setup: () => {
        return (buf: any) => JSON.parse(buf.toString());
      },
    },
    {
      name: 'sjson.parse()',
      setup: () => {
        const sjson = require('secure-json-parse');
        return (buf: any) => sjson.parse(buf.toString());
      },
    },
  ],
};

runBenchmark(benchmark);
