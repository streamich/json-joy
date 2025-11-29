// npx ts-node src/__bench__/bench.slice.ts

import {runBenchmark, type IBenchmark} from '../__bench__/runBenchmark';
import {CborEncoder} from '../cbor/CborEncoder';
import {CborDecoder} from '../cbor/CborDecoder';
import {payloads} from '../__bench__/payloads';
import {deepEqual} from '@jsonjoy.com/util/lib/json-equal/deepEqual';

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
  ],
};

runBenchmark(benchmark);
