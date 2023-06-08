// npx ts-node benchmarks/json-pack/bench.ubjson.decoding.ts

import {runBenchmark, Benchmark} from '../bench/runBenchmark';
import {UbjsonEncoder} from '../../src/json-pack/ubjson/UbjsonEncoder';
import {UbjsonDecoder} from '../../src/json-pack/ubjson/UbjsonDecoder';
import {Writer} from '../../src/util/buffers/Writer';
import {payloads} from './payloads';
import {deepEqual} from '../../src/json-equal/deepEqual';

const encoder = new UbjsonEncoder(new Writer());
const encodedPayloads = payloads.map((payload) => {
  return {
    ...payload,
    data: encoder.encode(payload.data),
  };
});

const benchmark: Benchmark = {
  name: 'Encoding',
  warmup: 1000,
  payloads: encodedPayloads,
  test: (payload: unknown, data: unknown): boolean => {
    const encoded = encoder.encode(data);
    return deepEqual(encoded, payload);
  },
  runners: [
    {
      name: 'json-joy/json-pack UbjsonDecoder',
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
