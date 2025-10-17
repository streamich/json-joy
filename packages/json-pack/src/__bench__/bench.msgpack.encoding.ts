// npx ts-node src/__bench__/bench.msgpack.encoding.ts

import {runBenchmark, type IBenchmark} from '../__bench__/runBenchmark';
import {MsgPackEncoder} from '../msgpack/MsgPackEncoder';
import {MsgPackEncoderFast} from '../msgpack/MsgPackEncoderFast';
import {CborDecoder} from '../cbor/CborDecoder';
import {payloads} from '../__bench__/payloads';
import {deepEqual} from '@jsonjoy.com/util/lib/json-equal/deepEqual';

const benchmark: IBenchmark = {
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
      name: 'json-pack MsgPackEncoderFast',
      setup: () => {
        const encoder = new MsgPackEncoderFast();
        return (data: any) => encoder.encode(data);
      },
    },
    {
      name: 'json-pack MsgPackEncoder',
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
        const {Encoder} = require('@msgpack/msgpack');
        const encoder = new Encoder();
        return (data: any) => encoder.encode(data);
      },
    },
    {
      name: 'msgpack-lite',
      setup: () => {
        const {encode} = require('msgpack-lite');
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
        const {encode} = require('messagepack');
        return (data: any) => encode(data);
      },
    },
  ],
};

runBenchmark(benchmark);
