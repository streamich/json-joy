// npx ts-node benchmarks/json-pack/bench.msgpack.encoding.ts

import {runBenchmark, Benchmark} from '../bench/runBenchmark';
import {MsgPackEncoder} from '../../src/json-pack/msgpack/MsgPackEncoder';
import {MsgPackEncoderFast} from '../../src/json-pack/msgpack/MsgPackEncoderFast';
import {CborDecoder} from '../../src/json-pack/cbor/CborDecoder';
import {payloads} from './payloads';
import {deepEqual} from '../../src/json-equal/deepEqual';

const benchmark: Benchmark = {
  name: 'MessagePack Encoding',
  warmup: 1000,
  payloads,
  test: (payload: unknown, data: unknown): boolean => {
    const decoder = new CborDecoder();
    const decoded = decoder.read(data as any);
    return deepEqual(decoded, payload);
  },
  runners: [
    {
      name: 'json-joy/json-pack MsgPackEncoderFast',
      setup: () => {
        const encoder = new MsgPackEncoderFast();
        return (data: any) => encoder.encode(data);
      },
    },
    {
      name: 'json-joy/json-pack MsgPackEncoder',
      setup: () => {
        const encoder = new MsgPackEncoder();
        return (data: any) => encoder.encode(data);
      },
    },
    {
      name: 'msgpackr',
      setup: () => {
        const {pack} = require('msgpackr');
        return (data: any) => pack(data);
      },
    },
    {
      name: '@msgpack/msgpack',
      setup: () => {
        const {Encoder} = require("@msgpack/msgpack");
        const encoder = new Encoder();
        return (data: any) => encoder.encode(data);
      },
    },
    {
      name: 'msgpack-lite',
      setup: () => {
        const {encode} = require("msgpack-lite");
        return (data: any) => encode(data);
      },
    },
    {
      name: 'msgpack5',
      setup: () => {
        const {encode} = require('msgpack5')();
        return (data: any) => encode(data);
      },
    },
    {
      name: 'messagepack',
      setup: () => {
        const {encode} = require("messagepack");
        return (data: any) => encode(data);
      },
    },
  ],
};

runBenchmark(benchmark);
