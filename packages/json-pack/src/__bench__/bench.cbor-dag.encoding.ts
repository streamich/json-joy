// npx ts-node src/__bench__/bench.cbor-dag.encoding.ts

import {runBenchmark, type IBenchmark} from '../__bench__/runBenchmark';
import {CborEncoderDag} from '../cbor/CborEncoderDag';
import {CborEncoder} from '../cbor/CborEncoder';
import {CborDecoder} from '../cbor/CborDecoder';
import {payloads} from '../__bench__/payloads';
import {deepEqual} from '@jsonjoy.com/util/lib/json-equal/deepEqual';

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
      name: 'json-pack CborEncoder',
      setup: () => {
        const encoder = new CborEncoder();
        return (json: any) => encoder.encode(json);
      },
    },
    {
      name: 'json-pack CborEncoderDag',
      setup: () => {
        const encoder = new CborEncoderDag();
        return (json: any) => encoder.encode(json);
      },
    },
    {
      name: 'cborg',
      setup: () => {
        const {encode} = require('cborg');
        return (json: any) => encode(json);
      },
    },
    {
      name: 'cbor-x',
      setup: () => {
        const {encode} = require('cbor-x');
        return (json: any) => encode(json);
      },
    },
    {
      name: 'Buffer.from(JSON.stringify)',
      setup: () => {
        return (json: any) => Buffer.from(JSON.stringify(json));
      },
    },
  ],
};

runBenchmark(benchmark);
