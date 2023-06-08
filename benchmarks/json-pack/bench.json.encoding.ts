// npx ts-node benchmarks/json-pack/bench.json.encoding.ts

import {runBenchmark, Benchmark} from '../bench/runBenchmark';
import {JsonEncoder} from '../../src/json-pack/json/JsonEncoder';
import {Writer} from '../../src/util/buffers/Writer';
import {payloads} from './payloads';
import {deepEqual} from '../../src/json-equal/deepEqual';
const safeStringify = require('fast-safe-stringify')

const benchmark: Benchmark = {
  name: 'Encoding',
  warmup: 1000,
  payloads,
  test: (payload: unknown, data: unknown): boolean => {
    const buf = Buffer.from(data as Uint8Array | Buffer);
    const json = JSON.parse(buf.toString());
    return deepEqual(payload, json);
  },
  runners: [
    {
      name: 'json-joy/json-pack JsonEncoder.encode()',
      setup: () => {
        const writer = new Writer();
        const encoder = new JsonEncoder(writer);
        return (json: any) => encoder.encode(json);
      },
    },
    {
      name: 'Native Buffer.from(JSON.stringify())',
      setup: () => {
        return (json: any) => Buffer.from(JSON.stringify(json));
      },
    },
    {
      name: 'fast-safe-stringify Buffer.from(stringify())',
      setup: () => {
        return (json: any) => {
          return Buffer.from(safeStringify(json));
        };
      },
    },
    {
      name: 'fast-safe-stringify Buffer.from(stableStringify())',
      setup: () => {
        return (json: any) => {
          return Buffer.from(safeStringify.stableStringify(json));
        };
      },
    },
  ],
};

runBenchmark(benchmark);
