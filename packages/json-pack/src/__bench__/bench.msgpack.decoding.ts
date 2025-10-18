// npx ts-node src/__bench__/bench.msgpack.decoding.ts

import {runBenchmark, type IBenchmark} from '../__bench__/runBenchmark';
import {MsgPackEncoderFast} from '../msgpack/MsgPackEncoderFast';
import {MsgPackDecoderFast} from '../msgpack/MsgPackDecoderFast';
import {MsgPackDecoder} from '../msgpack/MsgPackDecoder';
import {payloads} from '../__bench__/payloads';
import {deepEqual} from '@jsonjoy.com/util/lib/json-equal/deepEqual';

const encoder = new MsgPackEncoderFast();

const encodedPayloads = payloads.map((payload) => {
  return {
    ...payload,
    data: encoder.encode(payload.data),
  };
});

const benchmark: IBenchmark = {
  name: 'MessagePack Decoding',
  warmup: 1000,
  payloads: encodedPayloads,
  test: (payload: unknown, data: unknown): boolean => {
    const decoder = new MsgPackDecoderFast();
    const json = decoder.read(payload as Buffer);
    return deepEqual(json, data);
  },
  runners: [
    {
      name: 'json-pack MsgPackDecoderFast',
      setup: () => {
        const decoder = new MsgPackDecoderFast();
        return (data: any) => decoder.read(data);
      },
    },
    {
      name: 'json-pack MsgPackDecoder',
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
        const {Decoder} = require('@msgpack/msgpack');
        const decoder = new Decoder();
        return (data: any) => decoder.decode(data);
      },
    },
    {
      name: 'msgpack-lite',
      setup: () => {
        const {decode} = require('msgpack-lite');
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
        const {decode} = require('messagepack');
        return (data: any) => decode(data);
      },
    },
  ],
};

runBenchmark(benchmark);
