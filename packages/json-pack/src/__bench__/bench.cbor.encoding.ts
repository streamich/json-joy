// npx ts-node src/__bench__/bench.cbor.encoding.ts

import {runBenchmark, type IBenchmark} from '../__bench__/runBenchmark';
import {CborEncoder} from '../cbor/CborEncoder';
import {CborEncoderFast} from '../cbor/CborEncoderFast';
import {CborDecoder} from '../cbor/CborDecoder';
import {deepEqual} from '@jsonjoy.com/util/lib/json-equal/deepEqual';
import {payloads} from '../__bench__/payloads';

const benchmark: IBenchmark = {
  name: 'Encoding',
  warmup: 1000,
  payloads: payloads,
  test: (payload: unknown, data: unknown): boolean => {
    const decoder = new CborDecoder();
    const decoded = decoder.read(data as any);
    return deepEqual(decoded, payload);
  },
  runners: [
    {
      name: 'json-pack CborEncoderFast',
      setup: () => {
        const encoder = new CborEncoderFast();
        return (json: any) => encoder.encode(json);
      },
    },
    {
      name: 'json-pack CborEncoder',
      setup: () => {
        const encoder = new CborEncoder();
        return (json: any) => encoder.encode(json);
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
      name: 'cborg',
      setup: () => {
        const {encode} = require('cborg');
        return (json: any) => encode(json);
      },
    },
    {
      name: 'cbor',
      setup: () => {
        const {encode} = require('cbor');
        return (json: any) => encode(json);
      },
    },
  ],
};

runBenchmark(benchmark);
