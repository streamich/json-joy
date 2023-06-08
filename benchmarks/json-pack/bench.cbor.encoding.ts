// npx ts-node benchmarks/json-pack/bench.cbor.encoding.ts

import {runBenchmark, Benchmark} from '../bench/runBenchmark';
import {CborEncoder} from '../../src/json-pack/cbor/CborEncoder';
import {CborEncoderFast} from '../../src/json-pack/cbor/CborEncoderFast';
import {CborDecoder} from '../../src/json-pack/cbor/CborDecoder';
import {payloads} from './payloads';
import {deepEqual} from '../../src/json-equal/deepEqual';

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
      name: 'json-joy/json-pack CborEncoderFast',
      setup: () => {
        const encoder = new CborEncoderFast();
        return (json: any) => encoder.encode(json);
      },
    },
    {
      name: 'json-joy/json-pack CborEncoder',
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
