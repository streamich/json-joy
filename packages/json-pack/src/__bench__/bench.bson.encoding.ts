// npx ts-node src/__bench__/bench.bson.encoding.ts

import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {type IBenchmark, runBenchmark} from '@jsonjoy.com/util/lib/bench/runBenchmark';
import {deepEqual} from '@jsonjoy.com/util/lib/json-equal/deepEqual';
import {BSON, EJSON} from 'bson';
import {payloads as payloads_} from '../__bench__/payloads';
import {BsonEncoder} from '../bson/BsonEncoder';

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
      name: 'json-pack BsonEncoder',
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
