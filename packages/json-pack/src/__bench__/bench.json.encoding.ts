// npx ts-node src/__bench__/bench.json.encoding.ts

import {runBenchmark, type IBenchmark} from '../__bench__/runBenchmark';
import {JsonEncoder} from '../json/JsonEncoder';
import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {payloads} from '../__bench__/payloads';
import {deepEqual} from '@jsonjoy.com/util/lib/json-equal/deepEqual';
const safeStringify = require('fast-safe-stringify');

const benchmark: IBenchmark = {
  name: 'Encoding JSON',
  warmup: 1000,
  payloads,
  test: (payload: unknown, data: unknown): boolean => {
    const buf = Buffer.from(data as Uint8Array | Buffer);
    const json = JSON.parse(buf.toString());
    return deepEqual(payload, json);
  },
  runners: [
    {
      name: 'json-pack JsonEncoder.encode()',
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
