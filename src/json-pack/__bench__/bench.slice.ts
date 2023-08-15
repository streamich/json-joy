// npx ts-node src/json-pack/__bench__/bench.slice.ts

import {runBenchmark, IBenchmark} from '../../__bench__/runBenchmark';
import {CborEncoder} from '../cbor/CborEncoder';
import {CborDecoder} from '../cbor/CborDecoder';
import {payloads} from './payloads';
import {deepEqual} from '../../json-equal/deepEqual';

const encoder = new CborEncoder();

const benchmark: IBenchmark = {
  name: 'Encoding',
  warmup: 1000,
  payloads,
  test: (payload: unknown, data: unknown): boolean => {
    const decoder = new CborDecoder();
    const decoded = decoder.read(data as any);
    return deepEqual(decoded, payload);
  },
  runners: [
    {
      name: 'Uint8Array',
      setup: () => {
        return (json: any) => encoder.encode(json);
      },
    },
    {
      name: 'Slice',
      setup: () => {
        return (json: any) => encoder.encodeToSlice(json);
      },
    },
  ],
};

runBenchmark(benchmark);
