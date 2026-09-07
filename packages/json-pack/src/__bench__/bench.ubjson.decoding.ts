// npx ts-node src/__bench__/bench.ubjson.decoding.ts

import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {type IBenchmark, runBenchmark} from '@jsonjoy.com/util/lib/bench/runBenchmark';
import {deepEqual} from '@jsonjoy.com/util/lib/json-equal/deepEqual';
import {payloads} from '../__bench__/payloads';
import {UbjsonDecoder} from '../ubjson/UbjsonDecoder';
import {UbjsonEncoder} from '../ubjson/UbjsonEncoder';

const encoder = new UbjsonEncoder(new Writer());
const encodedPayloads = payloads.map((payload) => {
  return {
    ...payload,
    data: encoder.encode(payload.data),
  };
});

const benchmark: IBenchmark = {
  name: 'Encoding',
  warmup: 1000,
  payloads: encodedPayloads,
  test: (payload: unknown, data: unknown): boolean => {
    const encoded = encoder.encode(data);
    return deepEqual(encoded, payload);
  },
  runners: [
    {
      name: 'json-pack UbjsonDecoder',
      setup: () => {
        const decoder = new UbjsonDecoder();
        return (data: any) => decoder.read(data);
      },
    },
    {
      name: '@shelacek/ubjson',
      setup: () => {
        const {decode} = require('@shelacek/ubjson');
        return (data: any) => decode(data);
      },
    },
  ],
};

runBenchmark(benchmark);
