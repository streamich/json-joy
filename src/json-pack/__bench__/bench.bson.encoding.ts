// npx ts-node src/json-pack/__bench__/bench.bson.encoding.ts

import {runBenchmark, IBenchmark} from '../../__bench__/runBenchmark';
import {BsonEncoder} from '../bson/BsonEncoder';
import {Writer} from '../../util/buffers/Writer';
import {payloads as payloads_} from './payloads';
import {deepEqual} from '../../json-equal/deepEqual';
import {BSON, EJSON} from 'bson';

const payloads = payloads_.map((p) => ({...p, data: {data: p.data}}));

const benchmark: IBenchmark = {
  name: 'Encoding',
  warmup: 1000,
  payloads,
  test: (payload: unknown, data: unknown): boolean => {
    const buf = Buffer.from(data as Uint8Array | Buffer);
    const json = JSON.parse(buf.toString());
    return deepEqual(payload, json);
  },
  runners: [
    {
      name: 'json-joy/json-pack BsonEncoder',
      setup: () => {
        const writer = new Writer();
        const encoder = new BsonEncoder(writer);
        return (json: any) => encoder.encode(json);
      },
    },
    {
      name: 'bson BSON.serialize()',
      setup: () => {
        return (json: any) => {
          return BSON.serialize(json);
        };
      },
    },
    {
      name: 'bson Buffer.from(EJSON.stringify())',
      setup: () => {
        return (json: any) => {
          return Buffer.from(EJSON.stringify(json));
        };
      },
    },
  ],
};

runBenchmark(benchmark);
