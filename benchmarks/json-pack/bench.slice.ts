// npx ts-node benchmarks/json-pack/bench.slice.ts

import {runBenchmark, Benchmark} from '../bench/runBenchmark';
import {CborEncoder} from '../../src/json-pack/cbor/CborEncoder';
import {CborDecoder} from '../../src/json-pack/cbor/CborDecoder';
import {payloads} from './payloads';
import {deepEqual} from '../../src/json-equal/deepEqual';

const encoder = new CborEncoder();

const benchmark: Benchmark = {
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
