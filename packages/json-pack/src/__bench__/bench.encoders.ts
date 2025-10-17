// npx ts-node src/__bench__/bench.encoders.ts

import {runBenchmark, type IBenchmark} from '../__bench__/runBenchmark';
import {CborEncoder} from '../cbor/CborEncoder';
import {CborEncoderFast} from '../cbor/CborEncoderFast';
import {MsgPackEncoderFast} from '../msgpack/MsgPackEncoderFast';
import {MsgPackEncoder} from '../msgpack/MsgPackEncoder';
import {JsonEncoder} from '../json/JsonEncoder';
import {UbjsonEncoder} from '../ubjson/UbjsonEncoder';
import {IonEncoderFast} from '../ion/IonEncoderFast';
import {CborDecoder} from '../cbor/CborDecoder';
import {payloads} from '../__bench__/payloads';
import {deepEqual} from '@jsonjoy.com/util/lib/json-equal/deepEqual';
import {Writer} from '@jsonjoy.com/buffers/lib/Writer';

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
      name: 'CborEncoderFast',
      setup: () => {
        const encoder = new CborEncoderFast();
        return (json: any) => encoder.encode(json);
      },
    },
    {
      name: 'CborEncoder',
      setup: () => {
        const encoder = new CborEncoder();
        return (json: any) => encoder.encode(json);
      },
    },
    {
      name: 'MsgPackEncoderFast',
      setup: () => {
        const encoder = new MsgPackEncoderFast();
        return (json: any) => encoder.encode(json);
      },
    },
    {
      name: 'MsgPackEncoder',
      setup: () => {
        const encoder = new MsgPackEncoder();
        return (json: any) => encoder.encode(json);
      },
    },
    {
      name: 'JsonEncoder',
      setup: () => {
        const encoder = new JsonEncoder(new Writer());
        return (json: any) => encoder.encode(json);
      },
    },
    {
      name: 'UbjsonEncoder',
      setup: () => {
        const encoder = new UbjsonEncoder(new Writer());
        return (json: any) => encoder.encode(json);
      },
    },
    {
      name: 'IonEncoderFast',
      setup: () => {
        const encoder = new IonEncoderFast();
        return (json: any) => encoder.encode(json);
      },
    },
    {
      name: 'Buffer.from(JSON.stringify())',
      setup: () => {
        return (json: any) => Buffer.from(JSON.stringify(json));
      },
    },
  ],
};

runBenchmark(benchmark);
