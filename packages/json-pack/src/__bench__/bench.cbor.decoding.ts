// npx ts-node src/__bench__/bench.cbor.decoding.ts

import {runBenchmark, type IBenchmark} from '../__bench__/runBenchmark';
import {CborEncoder} from '../cbor/CborEncoder';
import {CborDecoderBase} from '../cbor/CborDecoderBase';
import {payloads} from '../__bench__/payloads';
import {deepEqual} from '@jsonjoy.com/util/lib/json-equal/deepEqual';

const encoder = new CborEncoder();

const encodedPayloads = payloads.map((payload) => {
  return {
    ...payload,
    data: encoder.encode(payload.data),
  };
});

const benchmark: IBenchmark = {
  name: 'CBOR Decoding',
  warmup: 1000,
  payloads: encodedPayloads,
  test: (payload: unknown, data: unknown): boolean => {
    const decoder = new CborDecoderBase();
    const json = decoder.read(payload as Buffer);
    return deepEqual(json, data);
  },
  runners: [
    {
      name: 'json-pack CborDecoder',
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
