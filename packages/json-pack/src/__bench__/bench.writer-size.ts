// npx ts-node src/__bench__/bench.writer-size.ts

import {runBenchmark, type IBenchmark} from '../__bench__/runBenchmark';
import {CborEncoder} from '../cbor/CborEncoder';
import {CborDecoder} from '../cbor/CborDecoder';
import {payloads} from '../__bench__/payloads';
import {deepEqual} from '@jsonjoy.com/util/lib/json-equal/deepEqual';
import {Writer} from '@jsonjoy.com/buffers/lib/Writer';

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
      name: '1 MB',
      setup: () => {
        const writer = new Writer(1024 * 256 * 4);
        const encoder = new CborEncoder(writer);
        return (json: any) => encoder.encode(json);
      },
    },
    {
      name: '256 KB',
      setup: () => {
        const writer = new Writer(1024 * 256);
        const encoder = new CborEncoder(writer);
        return (json: any) => encoder.encode(json);
      },
    },
    {
      name: '64 KB',
      setup: () => {
        const writer = new Writer(1024 * 64);
        const encoder = new CborEncoder(writer);
        return (json: any) => encoder.encode(json);
      },
    },
    {
      name: '16 KB',
      setup: () => {
        const writer = new Writer(1024 * 16);
        const encoder = new CborEncoder(writer);
        return (json: any) => encoder.encode(json);
      },
    },
    {
      name: '4 KB',
      setup: () => {
        const writer = new Writer(1024 * 4);
        const encoder = new CborEncoder(writer);
        return (json: any) => encoder.encode(json);
      },
    },
    {
      name: '1 KB',
      setup: () => {
        const writer = new Writer(1024);
        const encoder = new CborEncoder(writer);
        return (json: any) => encoder.encode(json);
      },
    },
  ],
};

runBenchmark(benchmark);
