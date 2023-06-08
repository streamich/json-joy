// npx ts-node benchmarks/json-pack/bench.encoders.ts

import {runBenchmark, Benchmark} from '../bench/runBenchmark';
import {CborEncoder} from '../../src/json-pack/cbor/CborEncoder';
import {CborEncoderFast} from '../../src/json-pack/cbor/CborEncoderFast';
import {MsgPackEncoderFast} from '../../src/json-pack/msgpack/MsgPackEncoderFast';
import {MsgPackEncoder} from '../../src/json-pack/msgpack/MsgPackEncoder';
import {JsonEncoder} from '../../src/json-pack/json/JsonEncoder';
import {UbjsonEncoder} from '../../src/json-pack/ubjson/UbjsonEncoder';
import {IonEncoderFast} from '../../src/json-pack/ion/IonEncoderFast';
import {CborDecoder} from '../../src/json-pack/cbor/CborDecoder';
import {payloads} from './payloads';
import {deepEqual} from '../../src/json-equal/deepEqual';
import {Writer} from '../../src/util/buffers/Writer';

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
