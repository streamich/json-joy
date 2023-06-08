// npx ts-node benchmarks/json-pack/bench.cbor.decoding.ts

import {runBenchmark, Benchmark} from '../bench/runBenchmark';
import {CborEncoder} from '../../src/json-pack/cbor/CborEncoder';
import {CborDecoderBase} from '../../src/json-pack/cbor/CborDecoderBase';
import {payloads} from './payloads';
import {deepEqual} from '../../src/json-equal/deepEqual';

const encoder = new CborEncoder();

const encodedPayloads = payloads.map((payload) => {
  return {
    ...payload,
    data: encoder.encode(payload.data),
  };
});

const benchmark: Benchmark = {
  name: 'CBOR Decoding',
  warmup: 1000,
  payloads: encodedPayloads,
  test: (payload: unknown, data: unknown): boolean => {
    const decoder = new CborDecoderBase();
    const json = decoder.read((payload as Buffer));
    return deepEqual(json, data);
  },
  runners: [
    {
      name: 'json-joy/json-pack CborDecoder',
      setup: () => {
        const decoder = new CborDecoderBase();
        return (data: any) => decoder.read(data);
      },
    },
    {
      name: 'cbor-x',
      setup: () => {
        const {decode} = require('cbor-x');
        return (data: any) => decode(data);
      },
    },
    {
      name: 'cborg',
      setup: () => {
        const {decode} = require('cborg');
        return (json: any) => decode(json);
      },
    },
    {
      name: 'cbor',
      setup: () => {
        const {decode} = require('cbor');
        return (data: any) => decode(data);
      },
    },
  ],
};

runBenchmark(benchmark);
