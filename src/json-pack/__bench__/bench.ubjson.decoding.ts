// npx ts-node src/json-pack/__bench__/bench.ubjson.decoding.ts

import {runBenchmark, IBenchmark} from '../../__bench__/runBenchmark';
import {UbjsonEncoder} from '../ubjson/UbjsonEncoder';
import {UbjsonDecoder} from '../ubjson/UbjsonDecoder';
import {Writer} from '../../util/buffers/Writer';
import {payloads} from './payloads';
import {deepEqual} from '../../json-equal/deepEqual';

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
