// npx ts-node src/json-pack/__bench__/bench.json.decoding.ts

import {runBenchmark, IBenchmark} from '../../__bench__/runBenchmark';
import {JsonDecoder} from '../json/JsonDecoder';
import {payloads} from './payloads';
import {deepEqual} from '../../json-equal/deepEqual';

const encodedPayloads = payloads.map((payload) => {
  return {
    ...payload,
    data: Buffer.from(JSON.stringify(payload.data)),
  };
});

const benchmark: IBenchmark = {
  name: 'Encoding',
  warmup: 1000,
  payloads: encodedPayloads,
  test: (payload: unknown, data: unknown): boolean => {
    const json = JSON.parse((payload as Buffer).toString());
    return deepEqual(json, data);
  },
  runners: [
    {
      name: 'json-joy/json-pack JsonDecoder.decode()',
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
