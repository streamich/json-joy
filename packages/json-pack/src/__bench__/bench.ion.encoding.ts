// npx ts-node src/__bench__/bench.ion.encoding.ts

import {runBenchmark, type IBenchmark} from '../__bench__/runBenchmark';
import {IonEncoderFast} from '../ion/IonEncoderFast';
import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {payloads} from '../__bench__/payloads';
import {load, makeBinaryWriter, dom} from 'ion-js';
import {deepEqual} from '@jsonjoy.com/util/lib/json-equal/deepEqual';

const benchmark: IBenchmark = {
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
      name: 'json-pack IonEncoderFast',
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
        };
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
