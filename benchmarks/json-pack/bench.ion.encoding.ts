// npx ts-node benchmarks/json-pack/bench.ion.encoding.ts

import {runBenchmark, Benchmark} from '../bench/runBenchmark';
import {IonEncoderFast} from '../../src/json-pack/ion/IonEncoderFast';
import {Writer} from '../../src/util/buffers/Writer';
import {payloads} from './payloads';
import {load, makeBinaryWriter, dom} from 'ion-js';
import {deepEqual} from '../../src/json-equal/deepEqual';

const benchmark: Benchmark = {
  name: 'Encoding',
  warmup: 1000,
  payloads,
  test: (payload: unknown, data: unknown): boolean => {
    const decoded = load(data as any);
    const json = JSON.parse(JSON.stringify(decoded));
    return deepEqual(payload, json);
  },
  runners: [
    {
      name: 'json-joy/json-pack IonEncoderFast',
      setup: () => {
        const writer = new Writer();
        const encoder = new IonEncoderFast(writer);
        return (json: any) => encoder.encode(json);
      },
    },
    {
      name: 'ion-js',
      setup: () => {
        return (json: any) => {
          const writer = makeBinaryWriter();
          dom.Value.from(json).writeTo(writer);
          writer.close();
          return writer.getBytes();
        }
      },
    },
    // {
    //   name: 'Buffer.from(JSON.stringify())',
    //   setup: () => {
    //     return (json: any) => Buffer.from(JSON.stringify(json));
    //   },
    // },
  ],
};

runBenchmark(benchmark);
