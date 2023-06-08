// npx ts-node benchmarks/json-pack/bench.msgpack.decoding.ts

import {runBenchmark, Benchmark} from '../bench/runBenchmark';
import {MsgPackEncoderFast} from '../../src/json-pack/msgpack/MsgPackEncoderFast';
import {MsgPackDecoderFast} from '../../src/json-pack/msgpack/MsgPackDecoderFast';
import {MsgPackDecoder} from '../../src/json-pack/msgpack/MsgPackDecoder';
import {payloads} from './payloads';
import {deepEqual} from '../../src/json-equal/deepEqual';

const encoder = new MsgPackEncoderFast();

const encodedPayloads = payloads.map((payload) => {
  return {
    ...payload,
    data: encoder.encode(payload.data),
  };
});

const benchmark: Benchmark = {
  name: 'MessagePack Decoding',
  warmup: 1000,
  payloads: encodedPayloads,
  test: (payload: unknown, data: unknown): boolean => {
    const decoder = new MsgPackDecoderFast();
    const json = decoder.read((payload as Buffer));
    return deepEqual(json, data);
  },
  runners: [
    {
      name: 'json-joy/json-pack MsgPackDecoderFast',
      setup: () => {
        const decoder = new MsgPackDecoderFast();
        return (data: any) => decoder.read(data);
      },
    },
    {
      name: 'json-joy/json-pack MsgPackDecoder',
      setup: () => {
        const decoder = new MsgPackDecoder();
        return (data: any) => decoder.read(data);
      },
    },
    {
      name: 'msgpackr',
      setup: () => {
        const {unpack} = require('msgpackr');
        return (data: any) => unpack(data);
      },
    },
    {
      name: '@msgpack/msgpack',
      setup: () => {
        const {Decoder} = require("@msgpack/msgpack");
        const decoder = new Decoder();
        return (data: any) => decoder.decode(data);
      },
    },
    {
      name: 'msgpack-lite',
      setup: () => {
        const {decode} = require("msgpack-lite");
        return (data: any) => decode(data);
      },
    },
    {
      name: 'msgpack5',
      setup: () => {
        const {decode} = require('msgpack5')();
        return (data: any) => decode(data);
      },
    },
    {
      name: 'messagepack',
      setup: () => {
        const {decode} = require("messagepack");
        return (data: any) => decode(data);
      },
    },
  ],
};

runBenchmark(benchmark);
